import {
  updateOperation,
  deleteOperation
} from '../../models/operationModel.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { result, initialCapital, montoRb, finalCapital, kellyUsed } = req.body;
    if (
      !['Ganada', 'Perdida'].includes(result) ||
      isNaN(initialCapital) ||
      isNaN(montoRb) ||
      isNaN(finalCapital) ||
      isNaN(kellyUsed)
    ) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }
    const op = await updateOperation(id, req.body);
    if (!op) return res.status(404).json({ error: 'Not found' });
    return res.json(op);
  }

  if (req.method === 'DELETE') {
    await deleteOperation(id);
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Método no permitido' });
}