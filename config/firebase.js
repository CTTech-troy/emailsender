const admin = require('firebase-admin');

function parseServiceAccountEnv(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    try {
      const fixed = raw.replace(/\\n/g, '\n');
      return JSON.parse(fixed);
    } catch (err2) {
      console.error('[firebase] Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', err2.message);
      return null;
    }
  }
}

const rawSa = process.env.FIREBASE_SERVICE_ACCOUNT;
const serviceAccount = parseServiceAccountEnv(rawSa);
if (!serviceAccount) {
  console.error('[firebase] FIREBASE_SERVICE_ACCOUNT is missing or invalid. Aborting init.');
  throw new Error('FIREBASE_SERVICE_ACCOUNT env var not set or invalid JSON');
}

const databaseURL = process.env.FIREBASE_DATABASE_URL;
if (!databaseURL) {
  console.error('[firebase] FIREBASE_DATABASE_URL is missing. Aborting init.');
  throw new Error('FIREBASE_DATABASE_URL env var not set');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL,
  });
  console.log('[firebase] Initialized with databaseURL:', databaseURL);
} else {
  console.log('[firebase] Firebase admin already initialized.');
}

const db = admin.database();
module.exports = db;