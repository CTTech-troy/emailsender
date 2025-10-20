const nodemailer = require("nodemailer");

let transporter;
// just check if it works
/**
 * Initialize and verify SMTP transporter.
 */
async function initMailer() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
  } = process.env;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: String(SMTP_SECURE).toLowerCase() === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.verify();
  console.log("✅ SMTP transporter verified and ready.");
}

/**
 * Send an email using initialized transporter.
 * @param {Object} mailData
 */
async function sendEmail(mailData) {
  if (!transporter) {
    throw new Error("SMTP transporter not initialized.");
  }

  const info = await transporter.sendMail(mailData);
  return info;
}

module.exports = { initMailer, sendEmail };
// yeah it works