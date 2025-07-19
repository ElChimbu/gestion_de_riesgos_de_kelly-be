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
    const ops = await getAllFixedOperations();
    res.json(ops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener operaciones de riesgo fijo' });
  }
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
      const op = await createFixedOperation(req.body);
      res.status(201).json(op);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al crear operación de riesgo fijo' });
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
      const op = await updateFixedOperation(req.params.id, req.body);
      if (!op) return res.status(404).json({ error: 'Operación no encontrada' });
      res.json(op);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al actualizar operación de riesgo fijo' });
    }
  }
);

// DELETE /api/fixed-operations/:id - Eliminar operación de riesgo fijo
router.delete('/:id', async (req, res) => {
  try {
    await deleteFixedOperation(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar operación de riesgo fijo' });
  }
});

// DELETE /api/fixed-operations - Eliminar todas las operaciones de riesgo fijo
router.delete('/', async (req, res) => {
  try {
    await deleteAllFixedOperations();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar todas las operaciones de riesgo fijo' });
  }
});

// GET /api/fixed-operations/stats - Obtener estadísticas
router.get('/stats', async (req, res) => {
  try {
    const stats = await getFixedOperationsStats();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

export default router; 