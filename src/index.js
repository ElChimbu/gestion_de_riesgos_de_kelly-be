import express from 'express';
import cors from 'cors';
import operationRoutes from './routes/operationRoutes.js';
import fixedOperationRoutes from './routes/fixedOperationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/operations', operationRoutes);
app.use('/api/fixed-operations', fixedOperationRoutes);
app.use('/api', uploadRoutes);

app.get('/', (req, res) => {
  res.send('API de Gestión de Riesgos de Kelly');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
}); 