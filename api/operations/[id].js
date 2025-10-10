import { updateOperation, deleteOperation } from '../../models/operationModel.js';
import { allowCors } from '../_helpers/cors.js';
import { getUidFromReq } from '../_helpers/firebase.js';

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const { type, result, amount, date, kellyPercent } = req.body;
      if (type && !['fixed', 'kelly'].includes(type)) return res.status(400).json({ error: 'type invalid' });
      if (result && !['win', 'loss'].includes(result)) return res.status(400).json({ error: 'result invalid' });
      if (amount !== undefined && typeof amount !== 'number') return res.status(400).json({ error: 'amount must be number' });

      const signedMonto = result ? (result === 'win' ? Math.abs(amount) : -Math.abs(amount)) : (amount !== undefined ? amount : undefined);
      let uid;
      try {
        uid = await getUidFromReq(req);
      } catch (err) {
        return res.status(401).json({ error: 'Unauthorized', message: err.message });
      }
      const updated = await updateOperation(id, {
        result: result === 'win' ? 'Ganada' : (result === 'loss' ? 'Perdida' : undefined),
        initialCapital: undefined,
        montoRb: signedMonto,
        finalCapital: undefined,
        kellyUsed: kellyPercent
      }, uid);

      if (!updated) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json({ id: updated.id, type, result, amount: signedMonto, date, kellyPercent });
    }

    if (req.method === 'DELETE') {
      let uid;
      try {
        uid = await getUidFromReq(req);
      } catch (err) {
        return res.status(401).json({ error: 'Unauthorized', message: err.message });
      }
      const ok = await deleteOperation(id, uid);
      return res.status(200).json({ success: ok });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
}
 