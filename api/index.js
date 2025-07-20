import express from 'express';
import cors from 'cors';
import operationRoutes from './routes/operationRoutes.js';
import fixedOperationRoutes from './routes/fixedOperationRoutes.js';
import { corsOptions, getAllowedOrigins } from './config/cors.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Aplicar middleware de CORS con configuración personalizada
app.use(cors(corsOptions));

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para logging de requests (útil para debugging)
app.use((req, res, next) => {
  const origin = req.get('Origin');
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${origin || 'No origin'}`);
  next();
});

// Rutas de operaciones normales
app.use('/api/operations', operationRoutes);

// Rutas de operaciones fijas
app.use('/api/fixed-operations', fixedOperationRoutes);

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'API de Gestión de Riesgos de Kelly',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Ruta de prueba para verificar que la API funciona
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled',
    allowedOrigins: getAllowedOrigins()
  });
});

// Ruta de health check para Vercel
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled'
  });
});

// Ruta para verificar configuración de CORS
app.get('/api/cors-info', (req, res) => {
  res.json({
    cors: 'enabled',
    allowedOrigins: getAllowedOrigins(),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    maxAge: 86400
  });
});

// Middleware para manejar errores de CORS
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    console.error('❌ CORS Error:', err);
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed',
      allowedOrigins: getAllowedOrigins(),
      requestOrigin: req.get('Origin')
    });
  }
  next(err);
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`,
    availableRoutes: [
      'GET /',
      'GET /api/test',
      'GET /api/health',
      'GET /api/cors-info',
      'GET /api/operations',
      'POST /api/operations',
      'PUT /api/operations/:id',
      'DELETE /api/operations/:id',
      'DELETE /api/operations',
      'GET /api/fixed-operations',
      'POST /api/fixed-operations',
      'PUT /api/fixed-operations/:id',
      'DELETE /api/fixed-operations/:id',
      'DELETE /api/fixed-operations',
      'GET /api/fixed-operations/stats'
    ]
  });
});

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    console.log(`📡 CORS habilitado para orígenes:`, getAllowedOrigins());
    console.log(`🔗 API disponible en: http://localhost:${PORT}`);
    console.log(`🔧 Modo: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app; 