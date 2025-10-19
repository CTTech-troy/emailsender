require("dotenv").config(); // ensure env loaded
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

try {
  const mailRoutes = require('./routes/mail.Routes');
  app.use('/api/mail', mailRoutes);
  console.log('Mounted /api/mail routes');
} catch (err) {
  console.warn('Could not mount mail routes:', err && err.message);
}

// error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  res.status(500).json({ status: 'error', message: err && err.message ? err.message : 'Internal server error' });
});

module.exports = app;
