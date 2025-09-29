# Configuración de CORS - API de Gestión de Riesgos de Kelly

## 📋 Descripción

Esta API está configurada con CORS (Cross-Origin Resource Sharing) para permitir peticiones desde el frontend de React, tanto en desarrollo como en producción.

## 🌐 Orígenes Permitidos

Los orígenes permitidos se configuran mediante la variable de entorno `ALLOWED_ORIGINS`.

### Valores por Defecto (Desarrollo)
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (Puerto alternativo)
- `http://localhost:4173` (Vite preview)
- `http://localhost:8080` (Puerto alternativo)

### Producción
Configura la variable `ALLOWED_ORIGINS` en Vercel con la URL de tu frontend, por ejemplo:
```
https://gestion-de-riesgos-de-kelly-fe.vercel.app
```

## 🔧 Configuración

### Métodos HTTP Permitidos
- `GET` - Obtener datos
- `POST` - Crear nuevos recursos
- `PUT` - Actualizar recursos
- `DELETE` - Eliminar recursos
- `OPTIONS` - Preflight requests
- `PATCH` - Actualizaciones parciales

### Headers Permitidos
- `Content-Type` - Tipo de contenido
- `Authorization` - Tokens de autenticación
- `X-Requested-With` - Identificador de AJAX
- `Accept` - Tipos de respuesta aceptados
- `Origin` - Origen de la petición
- `Cache-Control` - Control de caché
- `X-File-Name` - Nombre de archivos

### Headers Expuestos
- `Content-Length` - Longitud del contenido
- `Content-Type` - Tipo de contenido

## 🔐 Credenciales

Las credenciales están habilitadas (`credentials: true`), lo que permite:
- Cookies de sesión
- Headers de autorización
- Autenticación básica

## ⏱️ Cache

Los preflight requests se cachean por 24 horas (`maxAge: 86400`).

## 🚀 Uso en el Frontend

### Ejemplo con Fetch API
```javascript
// Configuración básica
const apiUrl = 'https://gestion-de-riesgos-de-kelly-p1elonza5.vercel.app';

// GET request
const response = await fetch(`${apiUrl}/api/operations`, {
  method: 'GET',
  credentials: 'include', // Para cookies
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token' // Si usas autenticación
  }
});

// POST request
const createResponse = await fetch(`${apiUrl}/api/operations`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    result: 'Ganada',
    initialCapital: 1000,
    montoRb: 100,
    finalCapital: 1100,
    kellyUsed: 0.1
  })
});
```

### Ejemplo con Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://gestion-de-riesgos-de-kelly-p1elonza5.vercel.app',
  withCredentials: true, // Para cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// GET request
const operations = await api.get('/api/operations');

// POST request
const newOperation = await api.post('/api/operations', {
  result: 'Ganada',
  initialCapital: 1000,
  montoRb: 100,
  finalCapital: 1100,
  kellyUsed: 0.1
});
```

## 🔍 Debugging

### Rutas de Información
- `GET /api/cors-info` - Información de configuración CORS
- `GET /api/health` - Estado de salud de la API
- `GET /api/test` - Prueba de funcionamiento

### Logs
La API registra todas las peticiones con:
- Timestamp
- Método HTTP
- Ruta
- Origen de la petición

### Errores de CORS
Si recibes errores de CORS:
1. Verifica que tu frontend esté en un origen permitido
2. Revisa los logs del servidor
3. Usa la ruta `/api/cors-info` para verificar la configuración

## 🛠️ Personalización

Para configurar orígenes permitidos:

### En Desarrollo Local
Edita tu archivo `.env`:
```
ALLOWED_ORIGINS=https://tu-dominio.com,http://localhost:5173
```

### En Producción (Vercel)
1. Ve a tu proyecto en Vercel
2. Configuración > Environment Variables
3. Agrega: `ALLOWED_ORIGINS` con el valor de tu frontend
4. Redeploy la aplicación

## 📝 Notas Importantes

1. **Vercel**: La configuración es compatible con Vercel
2. **Seguridad**: Solo se permiten orígenes específicos
3. **Performance**: Los preflight requests se cachean
4. **Debugging**: Logs detallados para troubleshooting

## 🔗 URLs de la API

- **Producción**: `https://gestion-de-riesgos-de-kelly-p1elonza5.vercel.app`
- **Desarrollo**: `http://localhost:3000` (cuando ejecutas localmente)

## 📞 Soporte

Si tienes problemas con CORS:
1. Verifica que tu frontend esté en un origen permitido
2. Revisa los logs del servidor
3. Usa las rutas de debugging mencionadas arriba 