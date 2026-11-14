require('dotenv').config();
const nodemailer = require('nodemailer');

const configured = !!process.env.SMTP_HOST;
const transporter = configured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
    })
  : null;

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

exports.sendInvite = async ({ to, name, link, expiresAt }) => {
  const when = new Date(expiresAt).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  if (!configured) {
    console.log(`\n[invite] Email is not set up. Send this link to ${to}:\n${link}\n(expires ${when})\n`);
    return false;
  }
  const first = String(name).split(' ')[0];
  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: 'You’re invited to RemDrumStudio',
    text: `Welcome to the team, ${first}.\n\nChoose a password to log in and see your schedule:\n${link}\n\nThis link works once and expires on ${when}.\nIf you weren’t expecting this, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#3b3f55">
<h2 style="color:#1c2556;margin:0 0 12px">Welcome to the team, ${esc(first)}</h2>
<p>The studio admin added you as a coach at RemDrumStudio. Choose a password to log in and see your schedule.</p>
<p><a href="${esc(link)}" style="display:inline-block;padding:12px 26px;background:#28346a;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">Set your password</a></p>
<p style="font-size:13px"><b>This link works once and expires on ${esc(when)}.</b><br>Button not working? Paste this into your browser:<br>${esc(link)}</p>
<p style="font-size:12px;color:#777">Weren’t expecting this? You can ignore this email. Nothing changes until you set a password.</p></div>`
  });
  return true;
};