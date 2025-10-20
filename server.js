const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup: set allowed origin via BACKEND .env CORS_ORIGIN (comma-separated) or use '*' for dev
const origins = (process.env.CORS_ORIGIN || '*').split(',').map(s => s.trim());
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (curl, server-to-server) and allow configured origins or all
    if (!origin || origins.includes('*') || origins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// allow preflight for all routes
app.options('*', cors(corsOptions));

// ...existing code: mount routes and start server...
// app.use('/api/mail', require('./routes/mail.Routes')); etc.