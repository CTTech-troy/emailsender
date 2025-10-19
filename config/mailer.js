const nodemailer = require('nodemailer');
require('dotenv').config();

// Use env vars. Set these in backend/.env
// SMTP_HOST, SMTP_PORT, SMTP_SECURE (true/false), SMTP_USER, SMTP_PASS
const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT || '587', 10);
const secure = (process.env.SMTP_SECURE || 'false') === 'true';

const transportOpts = {
  host,
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // optional TLS fallback
  tls: { rejectUnauthorized: false },
};

const transporter = nodemailer.createTransport(transportOpts);

// sanity verify (non-blocking) — logs will show if SMTP creds are wrong
transporter.verify((err, success) => {
  if (err) {
    console.warn('Mailer verify warning:', err && err.message);
  } else {
    console.log('Mailer verified OK');
  }
});

module.exports = transporter;