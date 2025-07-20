import pool from '../db.js';

export async function getAllOperations() {
  const { rows } = await pool.query('SELECT * FROM operations ORDER BY id ASC');
  return rows;
}

export async function createOperation(data) {
  // Extrae solo los campos válidos, ignora cualquier 'id' recibido
  const { result, initialCapital, montoRb, finalCapital, kellyUsed } = data;
  const { rows } = await pool.query(
    `INSERT INTO operations (result, initialCapital, montoRb, finalCapital, kellyUsed)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [result, initialCapital, montoRb, finalCapital, kellyUsed]
  );
  return rows[0];
}

export async function updateOperation(id, { result, initialCapital, montoRb, finalCapital, kellyUsed }) {
  const { rows } = await pool.query(
    `UPDATE operations SET result=$1, initialCapital=$2, montoRb=$3, finalCapital=$4, kellyUsed=$5 WHERE id=$6 RETURNING *`,
    [result, initialCapital, montoRb, finalCapital, kellyUsed, id]
  );
  return rows[0];
}

export async function deleteOperation(id) {
  await pool.query('DELETE FROM operations WHERE id = $1', [id]);
}

export async function deleteAllOperations() {
  await pool.query('DELETE FROM operations');
} 