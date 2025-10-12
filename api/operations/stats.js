import { getAllOperations } from '../../models/operationModel.js';
import { getAllFixedOperations } from '../../models/fixedOperationModel.js';
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

    // 1) Fetch operations table rows and map to unified shape
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

    // 2) Fetch fixed_operations rows and map to same shape
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
    } catch (err) {
      console.warn('Could not fetch fixed operations for stats:', err.message);
    }

    // 3) Combine and deduplicate (prefer any with source/sourceId)
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

    // 4) Compute metrics required by frontend dashboard
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
