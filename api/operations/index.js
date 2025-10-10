import { getAllOperations, createOperation, deleteAllOperations } from '../../models/operationModel.js';
import { getAllFixedOperations } from '../../models/fixedOperationModel.js';
import { allowCors } from '../_helpers/cors.js';
import { getUidFromReq } from '../_helpers/firebase.js';

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { limit, sort, meta } = req.query;
      let uid;
      try {
        uid = await getUidFromReq(req);
      } catch (err) {
        return res.status(401).json({ error: 'Unauthorized', message: err.message });
      }
  let ops = await getAllOperations(uid);

  // Map operations table rows to unified shape
  ops = ops.map(o => {
        // tolerate different column namings (camelCase or lowercase)
        const resultField = o.result || o.result;
        const mappedResult = (resultField === 'Ganada' || resultField === 'win') ? 'win' : 'loss';

        const finalCap = o.finalCapital || o.finalcapital || o.final_capital;
        const initialCap = o.initialCapital || o.initialcapital || o.initial_capital;
        const montoRb = ('montoRb' in o) ? o.montoRb : (o.montorb || o.monto_rb || 0);

        const rawAmount = (Number(finalCap) && Number(initialCap)) ? (Number(finalCap) - Number(initialCap)) : Number(montoRb || 0);
        const amount = mappedResult === 'win' ? Math.abs(rawAmount) : -Math.abs(rawAmount);

        const dateField = o.created_at || o.createdAt || o.date || o.fecha_hora_apertura || null;

        return {
          id: o.id,
          type: o.type || o.type || 'kelly',
          result: mappedResult,
          amount,
          date: dateField ? new Date(dateField).toISOString() : new Date().toISOString(),
          kellyPercent: o.kellyUsed || o.kellyused || o.kelly_percent || undefined
        };
      });

      // Fetch fixed operations and map to unified shape
      let fixedOps = [];
      try {
        const fixedRows = await getAllFixedOperations(uid);
        fixedOps = fixedRows.map(f => {
          const isWin = (f.result === 'Ganada' || f.result === 'win');
          const raw = Number(f.montoRb || 0);
          const amount = isWin ? Math.abs(raw) : -Math.abs(raw);
          const dateField = f.fechaHoraCierre || f.fechaHoraApertura || null;
          return {
            id: `fixed-${f.id}`,
            type: 'fixed',
            result: isWin ? 'win' : 'loss',
            amount,
            date: dateField ? new Date(dateField).toISOString() : new Date().toISOString(),
            kellyPercent: undefined
          };
        });
      } catch (err) {
        console.warn('Could not fetch fixed operations for aggregation:', err.message);
      }

      // Combine both sets
      let combined = [...ops, ...fixedOps];

      combined = combined.sort((a, b) => new Date(a.date) - new Date(b.date));
      if (sort === 'desc') combined = combined.reverse();
      if (limit) combined = combined.slice(0, Number(limit));

      if (meta === 'true' || process.env.INITIAL_CAPITAL) {
        const metaObj = {};
        if (process.env.INITIAL_CAPITAL) metaObj.initialCapital = Number(process.env.INITIAL_CAPITAL);
        return res.status(200).json({ operations: combined, meta: Object.keys(metaObj).length ? metaObj : undefined });
      }

      return res.status(200).json(combined);
    }

    if (req.method === 'POST') {
      const { type, result, amount, date, kellyPercent } = req.body;
      // basic validation
      if (!['fixed', 'kelly'].includes(type)) return res.status(400).json({ error: 'type invalid' });
      if (!['win', 'loss'].includes(result)) return res.status(400).json({ error: 'result invalid' });
      if (typeof amount !== 'number') return res.status(400).json({ error: 'amount must be number' });
      if (!date || isNaN(new Date(date))) return res.status(400).json({ error: 'date invalid' });

      // map to DB fields expected by createOperation
      let uid;
      try {
        uid = await getUidFromReq(req);
      } catch (err) {
        return res.status(401).json({ error: 'Unauthorized', message: err.message });
      }
      const signedMonto = result === 'win' ? Math.abs(amount) : -Math.abs(amount);
      const op = await createOperation({
        result: result === 'win' ? 'Ganada' : 'Perdida',
        initialCapital: undefined,
        montoRb: signedMonto,
        finalCapital: undefined,
        kellyUsed: kellyPercent,
        uid
      });

      return res.status(201).json({ id: op.id, type, result, amount, date, kellyPercent });
    }

    if (req.method === 'DELETE') {
      let uid;
      try {
        uid = await getUidFromReq(req);
      } catch (err) {
        return res.status(401).json({ error: 'Unauthorized', message: err.message });
      }
      await deleteAllOperations(uid);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
}
 