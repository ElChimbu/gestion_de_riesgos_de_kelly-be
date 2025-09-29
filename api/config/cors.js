/**
 * Configuración de CORS para la API de Gestión de Riesgos de Kelly
 *
 * Esta configuración permite peticiones desde orígenes definidos en variables de entorno
 * o valores por defecto para desarrollo.
 */

// Orígenes permitidos por defecto (desarrollo)
const defaultAllowedOrigins = [
  // Frontend de desarrollo local (Vite default)
  'http://localhost:5173',

  // Frontend de desarrollo alternativo (puerto 3000)
  'http://localhost:3000',

  // Frontend de desarrollo alternativo (puerto 4173 - Vite preview)
  'http://localhost:4173',

  // Frontend de desarrollo alternativo (puerto 8080)
  'http://localhost:8080'
];

// Función para obtener orígenes permitidos de variables de entorno o usar valores por defecto
const getAllowedOriginsFromEnv = () => {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    // Parsear orígenes separados por comas y limpiar espacios
    return envOrigins.split(',').map(origin => origin.trim()).filter(origin => origin.length > 0);
  }
  return defaultAllowedOrigins;
};

// Orígenes permitidos
const allowedOrigins = getAllowedOriginsFromEnv();

// Configuración de CORS
export const corsOptions = {
  // Orígenes permitidos
  origin: function (origin, callback) {
    // Permitir requests sin origin (como Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Verificar si el origin está en la lista de permitidos
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS: Origin permitido: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS: Origin no permitido: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  
  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  
  // Headers permitidos
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  
  // Headers expuestos al cliente
  exposedHeaders: [
    'Content-Length',
    'Content-Type'
  ],
  
  // Credenciales habilitadas (cookies, headers de autorización)
  credentials: true,
  
  // Tiempo máximo de cache para preflight requests (en segundos)
  maxAge: 86400, // 24 horas
  
  // Opciones adicionales
  optionsSuccessStatus: 200, // Para navegadores legacy
  preflightContinue: false
};

// Función para verificar si un origin está permitido
export const isOriginAllowed = (origin) => {
  return allowedOrigins.includes(origin);
};

// Función para obtener la lista de orígenes permitidos
export const getAllowedOrigins = () => {
  return [...allowedOrigins];
};

export default corsOptions; 