const Joi = require("joi");
const transporter = require("../config/mailer"); 
const db = require("../config/firebase");
require("dotenv").config();

// Validation schema
const emailSchema = Joi.object({
  fromName: Joi.string().optional(),
  fromEmail: Joi.string().email().optional(),
  to: Joi.alternatives().try(
    Joi.string().email(),
    Joi.array().items(Joi.string().email())
  ).required(),
  subject: Joi.string().max(255).required(),
  text: Joi.string().allow("", null),
  html: Joi.string().allow("", null),
  attachments: Joi.array().items(
    Joi.object({
      filename: Joi.string().required(),
      content: Joi.string().required(),
      encoding: Joi.string().optional(),
    })
  ).optional(),
});

exports.sendMail = async (req, res) => {
  try {
    const { error, value } = emailSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((d) => d.message),
      });
    }

    const { fromName, fromEmail, to, subject, text, html, attachments } = value;

    const fromAddress = fromEmail
      ? `"${fromName || "Sender"}" <${fromEmail}>`
      : `"${process.env.DEFAULT_FROM_NAME || "Mide Digital Agency"}" <${process.env.DEFAULT_FROM_EMAIL || process.env.SMTP_USER}>`;

    const formattedAttachments = (attachments || []).map((att) =>
      att.encoding === "base64"
        ? { filename: att.filename, content: Buffer.from(att.content, "base64") }
        : att
    );

    try { await transporter.verify(); } catch (e) { console.warn("Transporter verify warning:", e && e.message); }

    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      text: text || (html ? html.replace(/<[^>]+>/g, " ").trim() : ""),
      html,
      attachments: formattedAttachments,
    };

    const info = await transporter.sendMail(mailOptions);

    const record = {
      to,
      subject,
      html,
      text: mailOptions.text,
      sentAt: new Date().toISOString(),
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected,
      response: info?.response,
      status:
        (info?.accepted && info.accepted.length > 0) ||
        (info?.response && /250/.test(String(info.response)))
          ? "accepted"
          : "rejected",
    };

    try {
      const ref = db.ref("sentEmails").push();
      await ref.set(record);
    } catch (fbErr) {
      console.error("Failed to save to Firebase:", fbErr);
    }

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      info,
      record,
    });
  } catch (err) {
    console.error("❌ Mail send error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

exports.listEmails = async (req, res) => {
  try {
    const snap = await db.ref("sentEmails").once("value");
    const val = snap.val() || {};
    const items = Object.keys(val)
      .map((k) => ({ id: k, ...val[k] }))
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    return res.json(items);
  } catch (err) {
    console.error("listEmails error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getEmail = async (req, res) => {
  try {
    const snap = await db.ref(`sentEmails/${req.params.id}`).once("value");
    const val = snap.val();
    if (!val) return res.status(404).json({ status: "error", message: "Not found" });
    return res.json({ id: req.params.id, ...val });
  } catch (err) {
    console.error("getEmail error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.deleteEmail = async (req, res) => {
  try {
    await db.ref(`sentEmails/${req.params.id}`).remove();
    return res.json({ status: "success", message: "Deleted" });
  } catch (err) {
    console.error("deleteEmail error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};