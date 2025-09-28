# Configuración de Firebase Authentication

## Configuración del Proyecto

**Proyecto Firebase:** `misfinanzascrypto`
**Project ID:** `misfinanzascrypto`
**Auth Domain:** `misfinanzascrypto.firebaseapp.com`

## Pasos para configurar Firebase Admin SDK

### 1. Instalar dependencias
```bash
npm install firebase-admin
```

### 2. Configurar Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona el proyecto **misfinanzascrypto**
3. Ve a **Project Settings** (⚙️ icono de engranaje)
4. Ve a la pestaña **Service Accounts**
5. Haz clic en **Generate new private key**
6. Descarga el archivo JSON con las credenciales

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Configuración existente
PORT=3000
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_base_datos
NODE_ENV=development

# Configuración de Firebase Admin SDK para misfinanzascrypto
FIREBASE_PROJECT_ID=misfinanzascrypto
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@misfinanzascrypto.iam.gserviceaccount.com
```

**Nota:** El `FIREBASE_PRIVATE_KEY` debe incluir las comillas y los `\n` para los saltos de línea.

### 4. Ejecutar migración de base de datos

Ejecuta la migración para agregar el campo `uid` a las tablas:

```sql
-- Migración 003_add_uid_to_tables.sql
ALTER TABLE operations ADD COLUMN uid VARCHAR(255);
ALTER TABLE fixed_operations ADD COLUMN uid VARCHAR(255);
CREATE INDEX idx_operations_uid ON operations(uid);
CREATE INDEX idx_fixed_operations_uid ON fixed_operations(uid);
```

### 5. Verificar configuración

1. Inicia el servidor: `npm run dev`
2. Prueba la autenticación: `GET /api/auth-test`
3. Verifica que todas las rutas requieran autenticación

## Rutas protegidas

Todas las rutas de la API ahora requieren autenticación:

- `GET /api/operations` - Obtener operaciones del usuario
- `POST /api/operations` - Crear operación para el usuario
- `PUT /api/operations/:id` - Actualizar operación del usuario
- `DELETE /api/operations/:id` - Eliminar operación del usuario
- `DELETE /api/operations` - Eliminar todas las operaciones del usuario
- `GET /api/fixed-operations` - Obtener operaciones fijas del usuario
- `POST /api/fixed-operations` - Crear operación fija para el usuario
- `PUT /api/fixed-operations/:id` - Actualizar operación fija del usuario
- `DELETE /api/fixed-operations/:id` - Eliminar operación fija del usuario
- `DELETE /api/fixed-operations` - Eliminar todas las operaciones fijas del usuario
- `GET /api/fixed-operations/stats` - Estadísticas del usuario

## Información del usuario disponible

En todas las rutas protegidas, tienes acceso a:

- `req.user.uid` - ID único del usuario de Firebase
- `req.user.email` - Email del usuario
- `req.user.name` - Nombre del usuario
- `req.user.picture` - URL de la foto del usuario

## Headers requeridos

El frontend debe enviar el token de Firebase en el header:

```
Authorization: Bearer <firebase_jwt_token>
```

## Rutas de prueba

- `GET /api/test` - Prueba básica (sin autenticación)
- `GET /api/auth-test` - Prueba de autenticación (requiere token)
- `GET /api/health` - Health check para Vercel
- `GET /api/cors-info` - Información de configuración CORS

## Configuración del Frontend

Tu configuración de Firebase para el frontend:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDOtFNiiTQBx8Q1uG9BuY-0Rl6wXNX15Ko",
  authDomain: "misfinanzascrypto.firebaseapp.com",
  projectId: "misfinanzascrypto",
  storageBucket: "misfinanzascrypto.firebasestorage.app",
  messagingSenderId: "125737034568",
  appId: "1:125737034568:web:c5585b73dc5eb94e15497d",
  measurementId: "G-8FV6R7RX59"
};
``` 