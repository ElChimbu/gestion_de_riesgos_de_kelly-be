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
  try {
    const ops = await getAllOperations();
    res.json(ops);
  } catch (error) {
    console.error('Error in GET /operations:', error);
    res.status(500).json({ 
      error: 'Database connection error', 
      message: error.message 
    });
  }
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
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const op = await createOperation(req.body);
      res.status(201).json(op);
    } catch (error) {
      console.error('Error in POST /operations:', error);
      res.status(500).json({ 
        error: 'Database connection error', 
        message: error.message 
      });
    }
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
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const op = await updateOperation(req.params.id, req.body);
      if (!op) return res.status(404).json({ error: 'Not found' });
      res.json(op);
    } catch (error) {
      console.error('Error in PUT /operations:', error);
      res.status(500).json({ 
        error: 'Database connection error', 
        message: error.message 
      });
    }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    await deleteOperation(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /operations:', error);
    res.status(500).json({ 
      error: 'Database connection error', 
      message: error.message 
    });
  }
});

router.delete('/', async (req, res) => {
  try {
    await deleteAllOperations();
    res.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /operations:', error);
    res.status(500).json({ 
      error: 'Database connection error', 
      message: error.message 
    });
  }
});

export default router; 