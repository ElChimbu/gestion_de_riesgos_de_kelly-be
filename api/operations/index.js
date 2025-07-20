import {
  getAllOperations,
  createOperation,
  deleteAllOperations
} from '../../models/operationModel.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const ops = await getAllOperations();
    return res.json(ops);
  }

  if (req.method === 'POST') {
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
    const op = await createOperation(req.body);
    return res.status(201).json(op);
  }

  if (req.method === 'DELETE') {
    await deleteAllOperations();
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Método no permitido' });
}