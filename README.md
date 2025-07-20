# API de Gestión de Riesgos de Kelly

API backend para la gestión de riesgos de Kelly, construida con Node.js, Express y PostgreSQL.

## Características

- Gestión de operaciones
- Operaciones fijas
- Subida de archivos
- Base de datos PostgreSQL

## Instalación Local

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Copia el archivo `env.example` a `.env` y configura las variables de entorno
4. Ejecuta el servidor:
   ```bash
   npm run dev
   ```

## Deploy en Vercel

### Requisitos Previos

1. **Base de datos PostgreSQL**: Necesitas una base de datos PostgreSQL (recomendado: Supabase, PlanetScale, o Railway)
2. **Cuenta en Vercel**: Crea una cuenta en [vercel.com](https://vercel.com)

### Pasos para el Deploy

1. **Conecta tu repositorio a Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Node.js

2. **Configura las variables de entorno**:
   En el dashboard de Vercel, ve a Settings > Environment Variables y agrega:
   - `DATABASE_URL`: URL de tu base de datos PostgreSQL
   - `NODE_ENV`: `production`

3. **Deploy**:
   - Vercel hará el deploy automáticamente
   - Cada push a la rama principal activará un nuevo deploy

### Variables de Entorno Requeridas

- `DATABASE_URL`: URL de conexión a PostgreSQL
- `NODE_ENV`: Entorno de ejecución (production/development)
- `PORT`: Puerto del servidor (Vercel lo maneja automáticamente)

## Endpoints

- `GET /`: Información de la API
- `GET /api/operations`: Listar operaciones
- `POST /api/operations`: Crear operación
- `GET /api/fixed-operations`: Listar operaciones fijas
- `POST /api/fixed-operations`: Crear operación fija
- `POST /api/upload`: Subir archivos

## Estructura del Proyecto

```
├── api/
│   ├── index.js          # Servidor principal
│   ├── db.js            # Configuración de base de datos
│   ├── models/          # Modelos de datos
│   ├── routes/          # Rutas de la API
│   └── operations/      # Lógica de operaciones
├── migrations/          # Migraciones de base de datos
├── vercel.json         # Configuración de Vercel
└── package.json        # Dependencias y scripts
``` 