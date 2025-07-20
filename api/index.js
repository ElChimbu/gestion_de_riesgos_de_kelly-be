import express from 'express';
import cors from 'cors';
import operationRoutes from './routes/operationRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas de operaciones normales
app.use('/api/operations', operationRoutes);

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.send('API de Gestión de Riesgos de Kelly');
});

// Ruta de prueba para verificar que la API funciona
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
}

export default app; 