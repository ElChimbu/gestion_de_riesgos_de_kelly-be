import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getAllOperations,
  createOperation,
  updateOperation,
  deleteOperation,
  deleteAllOperations
} from '../models/operationModel.js';
import { getAllFixedOperations } from '../models/fixedOperationModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { limit, sort } = req.query;
    const uid = req.user.uid;

    // Fetch operations table rows and map to unified shape
    let ops = await getAllOperations(uid);
    ops = ops.map(o => {
      const mappedResult = (o.result === 'Ganada' || o.result === 'win') ? 'win' : 'loss';

      const finalCap = o.finalCapital || o.finalcapital || o.final_capital;
      const initialCap = o.initialCapital || o.initialcapital || o.initial_capital;
      const montoRb = ('montoRb' in o) ? o.montoRb : (o.montorb || o.monto_rb || 0);

      const rawAmount = (Number(finalCap) && Number(initialCap))
        ? (Number(finalCap) - Number(initialCap))
        : Number(montoRb || 0);

      const amount = mappedResult === 'win' ? Math.abs(rawAmount) : -Math.abs(rawAmount);

      const dateField = o.created_at || o.createdAt || o.date || o.fecha_hora_apertura || null;
      const source = o.source || null;
      const sourceId = o.source_id || o.sourceId || null;
      const type = source === 'fixed_operations' ? 'fixed' : 'kelly';

      return {
        id: o.id,
        type,
        result: mappedResult,
        amount,
        date: dateField ? new Date(dateField).toISOString() : new Date().toISOString(),
        kellyPercent: o.kellyUsed || o.kellyused || o.kelly_percent || undefined,
        source,
        sourceId: sourceId ? String(sourceId) : null
      };
    });

    // Fetch fixed operations and map to same unified shape
    let fixedOps = [];
    try {
      const fixedRows = await getAllFixedOperations(uid);
      fixedOps = fixedRows.map(f => {
        const isWin = (f.result === 'Ganada' || f.result === 'win');
        const amount = isWin ? Math.abs(Number(f.montoRb || 0)) : -Math.abs(Number(f.montoRb || 0));
        const dateField = f.fechaHoraCierre || f.fechaHoraApertura || null;
        return {
          id: `fixed-${f.id}`,
          type: 'fixed',
          result: isWin ? 'win' : 'loss',
          amount,
          date: dateField ? new Date(dateField).toISOString() : new Date().toISOString(),
          kellyPercent: undefined,
          source: 'fixed_operations',
          sourceId: String(f.id)
        };
      });
    } catch (e) {
      console.warn('Could not fetch fixed operations for aggregation:', e.message);
    }

    // Combine, dedupe (prefer source/sourceId), sort and limit
    let combined = [...ops, ...fixedOps];
    const seen = new Set();
    const deduped = [];
    for (const item of combined) {
      const key = item.source && item.sourceId ? `${item.source}:${item.sourceId}` : String(item.id);
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
    }
    combined = deduped.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sort === 'desc') combined = combined.reverse();
    if (limit) combined = combined.slice(0, Number(limit));

    return res.json(combined);
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
      const op = await createOperation({ ...req.body, uid: req.user.uid });
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
      const op = await updateOperation(req.params.id, req.body, req.user.uid);
      if (!op) return res.status(404).json({ error: 'Operación no encontrada o no pertenece al usuario' });
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
    const deleted = await deleteOperation(req.params.id, req.user.uid);
    if (!deleted) {
      return res.status(404).json({ error: 'Operación no encontrada o no pertenece al usuario' });
    }
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
    await deleteAllOperations(req.user.uid);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /operations:', error);
    res.status(500).json({ 
      error: 'Database connection error', 
      message: error.message 
    });
  }
});

/**
 * GET /api/operations/stats
 * Unified stats for dashboard, combining operations + fixed_operations.
 */
router.get('/stats', async (req, res) => {
  try {
    const uid = req.user.uid;
    const recentLimit = Number(req.query.recentLimit || 5);

    // Map operations
    let ops = await getAllOperations(uid);
    ops = ops.map(o => {
      const mappedResult = (o.result === 'Ganada' || o.result === 'win') ? 'win' : 'loss';

      const finalCap = o.finalCapital || o.finalcapital || o.final_capital;
      const initialCap = o.initialCapital || o.initialcapital || o.initial_capital;
      const montoRb = ('montoRb' in o) ? o.montoRb : (o.montorb || o.monto_rb || 0);

      const rawAmount = (Number(finalCap) && Number(initialCap))
        ? (Number(finalCap) - Number(initialCap))
        : Number(montoRb || 0);

      const amount = mappedResult === 'win' ? Math.abs(rawAmount) : -Math.abs(rawAmount);

      const dateField = o.created_at || o.createdAt || o.date || o.fecha_hora_apertura || null;
      const source = o.source || null;
      const sourceId = o.source_id || o.sourceId || null;
      const type = source === 'fixed_operations' ? 'fixed' : 'kelly';

      return {
        id: o.id,
        type,
        result: mappedResult,
        amount,
        date: dateField ? new Date(dateField).toISOString() : new Date().toISOString(),
        kellyPercent: o.kellyUsed || o.kellyused || o.kelly_percent || undefined,
        source,
        sourceId: sourceId ? String(sourceId) : null
      };
    });

    // Map fixed operations
    let fixedOps = [];
    try {
      const fixedRows = await getAllFixedOperations(uid);
      fixedOps = fixedRows.map(f => {
        const isWin = (f.result === 'Ganada' || f.result === 'win');
        const amount = isWin ? Math.abs(Number(f.montoRb || 0)) : -Math.abs(Number(f.montoRb || 0));
        const dateField = f.fechaHoraCierre || f.fechaHoraApertura || null;
        return {
          id: `fixed-${f.id}`,
          type: 'fixed',
          result: isWin ? 'win' : 'loss',
          amount,
          date: dateField ? new Date(dateField).toISOString() : new Date().toISOString(),
          kellyPercent: undefined,
          source: 'fixed_operations',
          sourceId: String(f.id)
        };
      });
    } catch (e) {
      console.warn('Could not fetch fixed operations for stats:', e.message);
    }

    // Combine and dedupe
    let combined = [...ops, ...fixedOps];
    const seen = new Set();
    const deduped = [];
    for (const item of combined) {
      const key = item.source && item.sourceId ? `${item.source}:${item.sourceId}` : String(item.id);
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
    }
    combined = deduped;

    // Metrics
    const totalOperations = combined.length;
    const wins = combined.filter(o => o.result === 'win').length;
    const winRate = totalOperations ? (wins / totalOperations) * 100 : 0;
    const totalProfit = combined.reduce((sum, o) => sum + Number(o.amount || 0), 0);

    const initialCapital = process.env.INITIAL_CAPITAL ? Number(process.env.INITIAL_CAPITAL) : 0;
    const currentCapital = initialCapital + totalProfit;

    const kellyOps = combined.filter(o => o.type === 'kelly' || o.kellyPercent !== undefined);
    const kellyAverage = kellyOps.length
      ? (kellyOps.reduce((s, o) => s + Number(o.kellyPercent || 0), 0) / kellyOps.length)
      : 0;

    const fixedRiskOperations = combined.filter(o => o.type === 'fixed').length;
    const kellyOperations = kellyOps.length;

    const recentOperations = combined
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, recentLimit)
      .map(o => ({
        id: o.id,
        type: o.type,
        result: o.result,
        amount: o.amount,
        date: o.date
      }));

    return res.json({
      totalOperations,
      winRate,
      totalProfit,
      currentCapital,
      initialCapital,
      kellyAverage,
      fixedRiskOperations,
      kellyOperations,
      recentOperations
    });
  } catch (error) {
    console.error('Error in GET /operations/stats:', error);
    res.status(500).json({
      error: 'Database connection error',
      message: error.message
    });
  }
});

export default router;