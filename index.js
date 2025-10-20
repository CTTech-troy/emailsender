// Ensure environment variables are loaded before anything else
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// mount mail routes
try {
  // adjust filename if your route file uses a different name
  const mailRoutes = require('./routes/mail.Routes');
  app.use('/api/mail', mailRoutes);
  console.log('Mounted /api/mail routes');
} catch (err) {
  console.warn('Could not mount /api/mail routes:', err && err.message);
}

// simple test route
app.get('/api/test', (req, res) => res.json({ ok: true }));

// error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  res.status(500).json({ status: 'error', message: err && err.message ? err.message : 'Internal server error' });
});

// start listening
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
