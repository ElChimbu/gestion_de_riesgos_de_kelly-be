import admin from 'firebase-admin';
import pool from '../db.js';

function initFirebase() {
  if (admin.apps && admin.apps.length) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined;

  if (!projectId || !clientEmail || !privateKey) {
    // Do not throw here; let verification fail later with clearer error when used
    console.warn('Firebase env vars not fully configured: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (err) {
    // If already initialized, ignore
    if (!/already exists/u.test(String(err))) console.warn('Firebase init error:', err.message);
  }
}

export async function getUidFromReq(req) {
  const auth = (req.headers && (req.headers.authorization || req.headers.Authorization)) || '';
  if (!auth || !auth.startsWith('Bearer ')) {
    const err = new Error('Missing or invalid Authorization header');
    err.code = 'NO_TOKEN';
    throw err;
  }
  const idToken = auth.split(' ')[1];
  initFirebase();
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    // Ensure user exists in users table (create on first login)
    const uid = decoded.uid;
    const email = decoded.email || null;
    try {
      await pool.query(
        `INSERT INTO users (firebase_uid, email) VALUES ($1, $2) ON CONFLICT (firebase_uid) DO NOTHING`,
        [uid, email]
      );
    } catch (dbErr) {
      // Log DB error but don't prevent auth; upstream handlers may still proceed
      console.warn('Could not upsert user in DB:', dbErr.message);
    }
    return uid;
  } catch (err) {
    err.code = 'INVALID_TOKEN';
    throw err;
  }
}
