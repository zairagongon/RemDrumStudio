require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const [role, firstName, lastName, email, password] = process.argv.slice(2);
const ROLES = ['admin', 'coach', 'parent', 'student'];

(async () => {
  if (!ROLES.includes(role) || !firstName || !lastName || !email || !password) {
    console.log('Usage: node database/createUser.js <admin|coach|parent|student> <firstName> <lastName> <email> <password>');
    process.exit(1);
  }
  if (password.length < 8) { console.log('Password must be at least 8 characters.'); process.exit(1); }
  try {
    const hash = await bcrypt.hash(password, 10);
    // Coaches must choose their own password on first login
    await db.execute(
      'INSERT INTO users (first_name, last_name, email, password_hash, role, must_change_password, password_set_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [firstName, lastName, email.toLowerCase(), hash, role, role === 'coach' ? 1 : 0]
    );
    console.log(`Created ${role}: ${email}`);
  } catch (err) {
    console.log(err.code === 'ER_DUP_ENTRY' ? 'That email already exists.' : err.message);
  }
  process.exit(0);
})();