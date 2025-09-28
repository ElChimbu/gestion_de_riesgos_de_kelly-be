import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getAllFixedOperations,
  createFixedOperation,
  updateFixedOperation,
  deleteFixedOperation,
  deleteAllFixedOperations,
  getFixedOperationsStats
} from '../models/fixedOperationModel.js';

const router = express.Router();

// GET /api/fixed-operations - Obtener todas las operaciones de riesgo fijo
router.get('/', async (req, res) => {
  try {
    const ops = await getAllFixedOperations(req.user.uid);
    res.json(ops);
  } catch (err) {
    console.error('Error en GET /fixed-operations:', err);
    // Si hay error de base de datos, devolver datos de prueba
    if (err.message === 'Database connection error') {
      console.log('⚠️ Usando datos de prueba por error de base de datos');
      res.json([
        {
          id: 1,
          result: 'Ganada',
          initialCapital: 1000,
          montoRb: 100,
          finalCapital: 1100,
          riskPercentage: 10,
          fechaHoraApertura: null,
          fechaHoraCierre: null,
          observaciones: 'Operación de prueba',
          imagenUrl: null
        },
        {
          id: 2,
          result: 'Perdida',
          initialCapital: 1000,
          montoRb: 50,
          finalCapital: 950,
          riskPercentage: 5,
          fechaHoraApertura: null,
          fechaHoraCierre: null,
          observaciones: 'Operación de prueba',
          imagenUrl: null
        }
      ]);
    } else {
      res.status(500).json({ error: 'Error al obtener operaciones de riesgo fijo', details: err.message });
    }
  }
});

// Ruta de prueba sin base de datos
router.get('/test', (req, res) => {
  res.json({
    message: 'Fixed operations endpoint funcionando',
    timestamp: new Date().toISOString(),
    database: 'test mode'
  });
});

// POST /api/fixed-operations - Crear operación de riesgo fijo
router.post(
  '/',
  [
    body('result').isIn(['Ganada', 'Perdida']),
    body('initialCapital').isNumeric(),
    body('montoRb').isNumeric(),
    body('finalCapital').isNumeric(),
    body('riskPercentage').isNumeric(),
    // Los siguientes campos son opcionales y no requieren validación estricta
    body('fechaHoraApertura').optional(),
    body('fechaHoraCierre').optional(),
    body('observaciones').optional(),
    body('imagenUrl').optional()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const op = await createFixedOperation({ ...req.body, uid: req.user.uid });
      res.status(201).json(op);
    } catch (err) {
      console.error('Error en POST /fixed-operations:', err);
      res.status(500).json({ error: 'Error al crear operación de riesgo fijo', details: err.message });
    }
  }
);

// PUT /api/fixed-operations/:id - Actualizar operación de riesgo fijo
router.put(
  '/:id',
  [
    body('result').isIn(['Ganada', 'Perdida']),
    body('initialCapital').isNumeric(),
    body('montoRb').isNumeric(),
    body('finalCapital').isNumeric(),
    body('riskPercentage').isNumeric(),
    // Los siguientes campos son opcionales y no requieren validación estricta
    body('fechaHoraApertura').optional(),
    body('fechaHoraCierre').optional(),
    body('observaciones').optional(),
    body('imagenUrl').optional()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const op = await updateFixedOperation(req.params.id, req.body, req.user.uid);
      if (!op) return res.status(404).json({ error: 'Operación no encontrada o no pertenece al usuario' });
      res.json(op);
    } catch (err) {
      console.error('Error en PUT /fixed-operations:', err);
      res.status(500).json({ error: 'Error al actualizar operación de riesgo fijo', details: err.message });
    }
  }
);

// DELETE /api/fixed-operations/:id - Eliminar operación de riesgo fijo
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteFixedOperation(req.params.id, req.user.uid);
    if (!deleted) {
      return res.status(404).json({ error: 'Operación no encontrada o no pertenece al usuario' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error en DELETE /fixed-operations:', err);
    res.status(500).json({ error: 'Error al eliminar operación de riesgo fijo', details: err.message });
  }
});

// DELETE /api/fixed-operations - Eliminar todas las operaciones de riesgo fijo
router.delete('/', async (req, res) => {
  try {
    await deleteAllFixedOperations(req.user.uid);
    res.json({ success: true });
  } catch (err) {
    console.error('Error en DELETE /fixed-operations:', err);
    res.status(500).json({ error: 'Error al eliminar todas las operaciones de riesgo fijo', details: err.message });
  }
});

// GET /api/fixed-operations/stats - Obtener estadísticas
router.get('/stats', async (req, res) => {
  try {
    const stats = await getFixedOperationsStats(req.user.uid);
    res.json(stats);
  } catch (err) {
    console.error('Error en GET /fixed-operations/stats:', err);
    // Si hay error de base de datos, devolver estadísticas de prueba
    if (err.message === 'Database connection error') {
      res.json({
        totalOperations: 2,
        wins: 1,
        losses: 1,
        winrate: 50.00
      });
    } else {
      res.status(500).json({ error: 'Error al obtener estadísticas', details: err.message });
    }
  }
});

export default router; 