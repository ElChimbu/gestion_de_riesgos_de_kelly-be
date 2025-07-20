import pool from '../db.js';

export async function getAllOperations() {
  try {
    const { rows } = await pool.query('SELECT * FROM operations ORDER BY id ASC');
    return rows;
  } catch (error) {
    console.error('Error getting operations:', error);
    throw new Error('Database connection error');
  }
}

export async function createOperation(data) {
  try {
    // Extrae solo los campos válidos, ignora cualquier 'id' recibido
    const { result, initialCapital, montoRb, finalCapital, kellyUsed } = data;
    const { rows } = await pool.query(
      `INSERT INTO operations (result, initialCapital, montoRb, finalCapital, kellyUsed)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [result, initialCapital, montoRb, finalCapital, kellyUsed]
    );
    return rows[0];
  } catch (error) {
    console.error('Error creating operation:', error);
    throw new Error('Database connection error');
  }
}

export async function updateOperation(id, { result, initialCapital, montoRb, finalCapital, kellyUsed }) {
  try {
    const { rows } = await pool.query(
      `UPDATE operations SET result=$1, initialCapital=$2, montoRb=$3, finalCapital=$4, kellyUsed=$5 WHERE id=$6 RETURNING *`,
      [result, initialCapital, montoRb, finalCapital, kellyUsed, id]
    );
    return rows[0];
  } catch (error) {
    console.error('Error updating operation:', error);
    throw new Error('Database connection error');
  }
}

export async function deleteOperation(id) {
  try {
    await pool.query('DELETE FROM operations WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting operation:', error);
    throw new Error('Database connection error');
  }
}

export async function deleteAllOperations() {
  try {
    await pool.query('DELETE FROM operations');
  } catch (error) {
    console.error('Error deleting all operations:', error);
    throw new Error('Database connection error');
  }
} 