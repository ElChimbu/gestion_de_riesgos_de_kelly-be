import { getAllOperations } from '../../models/operationModel.js';
import { allowCors } from '../_helpers/cors.js';
import { getUidFromReq } from '../_helpers/firebase.js';

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    let uid;
    try {
      uid = await getUidFromReq(req);
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized', message: err.message });
    }
    const recentLimit = Number(req.query.recentLimit || 5);
    let ops = await getAllOperations(uid);

    const totalOperations = ops.length;
    const wins = ops.filter(o => o.result === 'Ganada' || o.result === 'win').length;
    const winRate = totalOperations ? (wins / totalOperations) * 100 : 0;
    // Ensure monto sign: wins positive, losses negative (model stores 'Ganada'/'Perdida' and monto field may be named differently)
    const totalProfit = ops.reduce((sum, o) => {
      const isWin = (o.result === 'Ganada' || o.result === 'win');
      const raw = ('montoRb' in o) ? Number(o.montoRb || 0) : Number(o.montorb || o.monto_rb || 0);
      const signed = isWin ? Math.abs(raw) : -Math.abs(raw);
      return sum + signed;
    }, 0);
    const initialCapital = process.env.INITIAL_CAPITAL ? Number(process.env.INITIAL_CAPITAL) : 0;
    const currentCapital = initialCapital + totalProfit;

    const kellyOps = ops.filter(o => (o.type === 'kelly' || o.type === 'Kelly' || o.kellyUsed));
    const kellyAverage = kellyOps.length ? (kellyOps.reduce((s, o) => s + Number(o.kellyUsed || o.kelly_percent || 0), 0) / kellyOps.length) : 0;
    const fixedRiskOperations = ops.filter(o => o.type === 'fixed').length;
    const kellyOperations = kellyOps.length;

    ops = ops.sort((a, b) => new Date(b.created_at || b.date || b.createdAt) - new Date(a.created_at || a.date || a.createdAt));
    const recentOperations = ops.slice(0, recentLimit).map(o => {
      const isWin = (o.result === 'Ganada' || o.result === 'win');
      const raw = ('montoRb' in o) ? Number(o.montoRb || 0) : Number(o.montorb || o.monto_rb || 0);
      const amount = isWin ? Math.abs(raw) : -Math.abs(raw);
      const dateField = o.created_at || o.date || o.createdAt || null;
      return { id: o.id, type: o.type || 'kelly', result: isWin ? 'win' : 'loss', amount, date: dateField ? new Date(dateField).toISOString() : new Date().toISOString() };
    });

    return res.status(200).json({
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
}
