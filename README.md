# Backend - Gestión de Riesgos de Kelly

## Requisitos
- Node.js 18+
- PostgreSQL

## Instalación

1. Clona el repositorio y entra a la carpeta del proyecto.
2. Copia el archivo `.env.example` a `.env` y configura tu conexión a PostgreSQL.
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Crea la base de datos en PostgreSQL (por ejemplo, `kellydb`).
5. Ejecuta la migración para crear la tabla:
   ```bash
   psql -d kellydb -f migrations/001_create_operations_table.sql
   ```

## Uso

- Inicia el servidor en modo desarrollo:
  ```bash
  npm run dev
  ```
- O en modo producción:
  ```bash
  npm start
  ```

La API estará disponible en `http://localhost:3000/api/operations`

## Endpoints

- `GET    /api/operations`         → Devuelve todas las operaciones
- `POST   /api/operations`         → Crea una operación
- `PUT    /api/operations/:id`     → Actualiza una operación por id
- `DELETE /api/operations/:id`     → Elimina una operación por id
- `DELETE /api/operations`         → Elimina todas las operaciones 