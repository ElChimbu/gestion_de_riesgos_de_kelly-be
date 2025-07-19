import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getAllOperations,
  createOperation,
  updateOperation,
  deleteOperation,
  deleteAllOperations
} from '../models/operationModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const ops = await getAllOperations();
  res.json(ops);
});

router.post(
  '/',
  [
    body('result').isIn(['Ganada', 'Perdida']),
    body('initialCapital').isNumeric(),
    body('montoRb').isNumeric(),
    body('finalCapital').isNumeric(),
    body('kellyUsed').isNumeric()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const op = await createOperation(req.body);
    res.status(201).json(op);
  }
);

router.put(
  '/:id',
  [
    body('result').isIn(['Ganada', 'Perdida']),
    body('initialCapital').isNumeric(),
    body('montoRb').isNumeric(),
    body('finalCapital').isNumeric(),
    body('kellyUsed').isNumeric()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const op = await updateOperation(req.params.id, req.body);
    if (!op) return res.status(404).json({ error: 'Not found' });
    res.json(op);
  }
);

router.delete('/:id', async (req, res) => {
  await deleteOperation(req.params.id);
  res.json({ success: true });
});

router.delete('/', async (req, res) => {
  await deleteAllOperations();
  res.json({ success: true });
});

export default router; 