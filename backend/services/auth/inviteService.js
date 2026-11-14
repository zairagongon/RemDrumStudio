const bcrypt = require('bcryptjs');
const userModel = require('../../models/shared/userModel');
const inviteModel = require('../../models/shared/inviteModel');
const authService = require('./authService');

const httpError = (status, message) => Object.assign(new Error(message), { status });

async function checkToken(token) {
  const row = await inviteModel.findByHash(inviteModel.hashToken(token));
  if (!row || row.used_at || new Date(row.expires_at) < new Date() || !row.is_active) {
    throw httpError(410, 'This invite link has expired or was already used.');
  }
  return row;
}

exports.inviteInfo = async token => {
  const row = await checkToken(token);
  return { name: `${row.first_name} ${row.last_name}`.trim(), email: row.email };
};

exports.acceptInvite = async (token, password) => {
  const row = await checkToken(token);
  await userModel.setPassword(row.user_id, await bcrypt.hash(password, 10));
  await inviteModel.markUsed(row.id);
  const user = await userModel.findById(row.user_id);
  return { token: authService.makeToken(user), user: authService.toPublic(user) };
};