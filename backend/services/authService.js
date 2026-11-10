require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('JWT_SECRET is missing. Add it to backend/.env');
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const httpError = (status, message) => Object.assign(new Error(message), { status });
const toPublic = u => ({
  id: u.id,
  name: `${u.first_name} ${u.last_name}`,
  email: u.email,
  role: u.role,
  mustChangePassword: !!u.must_change_password
});
const makeToken = u => jwt.sign({ id: u.id, role: u.role }, SECRET, { expiresIn: EXPIRES });

exports.signup = async ({ role, firstName, lastName, email, password }) => {
  const cleanEmail = email.trim().toLowerCase();
  if (await userModel.findByEmail(cleanEmail)) throw httpError(409, 'An account with this email already exists.');

  const passwordHash = await bcrypt.hash(password, 10);
  let id;
  try {
    id = await userModel.create({ firstName: firstName.trim(), lastName: lastName.trim(), email: cleanEmail, passwordHash, role });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw httpError(409, 'An account with this email already exists.');
    throw err;
  }
  const user = await userModel.findById(id);
  return { token: makeToken(user), user: toPublic(user) };
};

exports.login = async ({ email, password }) => {
  const user = await userModel.findByEmail(email.trim().toLowerCase());
  const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) throw httpError(401, 'Incorrect email or password.');
  if (!user.is_active) throw httpError(403, 'This account has been deactivated. Please contact the studio.');
  return { token: makeToken(user), user: toPublic(user) };
};

exports.getMe = async id => {
  const user = await userModel.findById(id);
  if (!user || !user.is_active) throw httpError(401, 'Please log in again.');
  return toPublic(user);
};

exports.verifyToken = token => jwt.verify(token, SECRET);