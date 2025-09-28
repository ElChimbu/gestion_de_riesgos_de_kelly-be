import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Inicializar Firebase Admin SDK
const initializeFirebase = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      })
    });
    
    console.log('✅ Firebase Admin SDK inicializado correctamente');
    return admin;
  } catch (error) {
    console.error('❌ Error inicializando Firebase Admin SDK:', error);
    throw error;
  }
};

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Token requerido',
      message: 'Se requiere un token de autenticación válido'
    });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('❌ Error verificando token:', error);
    return res.status(403).json({ 
      error: 'Token inválido',
      message: 'El token de autenticación no es válido o ha expirado'
    });
  }
};

// Función para verificar que un recurso pertenece al usuario
const verifyResourceOwnership = async (db, table, resourceId, uid) => {
  const result = await db.query(
    `SELECT * FROM ${table} WHERE id = $1 AND uid = $2`,
    [resourceId, uid]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Recurso no encontrado o no pertenece al usuario');
  }
  
  return result.rows[0];
};

export { initializeFirebase, authenticateToken, verifyResourceOwnership }; 