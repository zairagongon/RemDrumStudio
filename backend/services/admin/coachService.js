const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const userModel = require('../../models/shared/userModel');
const coachModel = require('../../models/admin/coachModel');
const inviteModel = require('../../models/shared/inviteModel');
const mailService = require('./mailService');

const INVITE_DAYS = 3;
const httpError = (status, message) => Object.assign(new Error(message), { status });

const shape = r => {
  let status = 'active';
  if (!r.is_active) status = 'inactive';
  else if (!r.password_set_at) status = r.invite_expires && new Date(r.invite_expires) > new Date() ? 'invited' : 'expired';
  return {
    id: r.id,
    name: `${r.first_name} ${r.last_name}`.trim(),
    email: r.email,
    instruments: r.instruments ? r.instruments.split(',') : [],
    inBand: !!r.in_band,
    status,
    inviteExpiresAt: status === 'invited' ? r.invite_expires : null
  };
};

// Makes a one-time link (valid 3 days) and emails it. Returns the link too, so the admin can copy it.
async function issueInvite(coach) {
  await inviteModel.deleteUnusedForUser(coach.id);
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000);
  await inviteModel.create({ userId: coach.id, tokenHash: inviteModel.hashToken(token), expiresAt });
  const link = `${process.env.APP_URL || 'http://localhost:5173'}/set-password/${token}`;
  let emailSent = false;
  try { emailSent = await mailService.sendInvite({ to: coach.email, name: coach.name, link, expiresAt }); }
  catch (err) { console.error('Invite email failed:', err.message); }
  return { inviteLink: link, inviteExpiresAt: expiresAt, emailSent };
}

exports.list = async () => (await coachModel.list()).map(shape);

exports.create = async ({ fullName, email, instruments, inBand }) => {
  const cleanEmail = email.trim().toLowerCase();
  if (await userModel.findByEmail(cleanEmail)) throw httpError(409, 'An account with this email already exists.');
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts.shift();
  const lastName = parts.join(' ');
  const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10); // unusable until they set their own
  let id;
  try { id = await userModel.createInvited({ firstName, lastName, email: cleanEmail, passwordHash, role: 'coach' }); }
  catch (err) { if (err.code === 'ER_DUP_ENTRY') throw httpError(409, 'An account with this email already exists.'); throw err; }
  await coachModel.createProfile(id, instruments.join(','), inBand);
  const invite = await issueInvite(shape(await coachModel.findById(id)));
  return { coach: shape(await coachModel.findById(id)), ...invite }; // read again so the status shows "invited"
};

exports.resendInvite = async id => {
  const row = await coachModel.findById(id);
  if (!row) throw httpError(404, 'Coach not found.');
  if (!row.is_active) throw httpError(400, 'Reactivate this coach first.');
  const coach = shape(row);
  const invite = await issueInvite(coach);
  return { coach: shape(await coachModel.findById(id)), ...invite };
};

exports.update = async (id, { inBand, isActive }) => {
  if (!(await coachModel.findById(id))) throw httpError(404, 'Coach not found.');
  if (typeof inBand === 'boolean') await coachModel.setBand(id, inBand);
  if (typeof isActive === 'boolean') await coachModel.setActive(id, isActive);
  return shape(await coachModel.findById(id));
};