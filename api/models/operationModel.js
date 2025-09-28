import pool from '../db.js';

export async function getAllOperations(uid) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM operations WHERE uid = $1 ORDER BY id ASC',
      [uid]
    );
    return rows;
  } catch (error) {
    console.error('Error getting operations:', error);
    throw new Error('Database connection error');
  }
}

export async function createOperation(data) {
  try {
    // Extrae solo los campos válidos, incluye uid
    const { result, initialCapital, montoRb, finalCapital, kellyUsed, uid } = data;
    const { rows } = await pool.query(
      `INSERT INTO operations (result, initialCapital, montoRb, finalCapital, kellyUsed, uid)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [result, initialCapital, montoRb, finalCapital, kellyUsed, uid]
    );
    return rows[0];
  } catch (error) {
    console.error('Error creating operation:', error);
    throw new Error('Database connection error');
  }
}

export async function updateOperation(id, { result, initialCapital, montoRb, finalCapital, kellyUsed }, uid) {
  try {
    const { rows } = await pool.query(
      `UPDATE operations SET result=$1, initialCapital=$2, montoRb=$3, finalCapital=$4, kellyUsed=$5 
       WHERE id=$6 AND uid=$7 RETURNING *`,
      [result, initialCapital, montoRb, finalCapital, kellyUsed, id, uid]
    );
    return rows[0];
  } catch (error) {
    console.error('Error updating operation:', error);
    throw new Error('Database connection error');
  }
}

export async function deleteOperation(id, uid) {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM operations WHERE id = $1 AND uid = $2',
      [id, uid]
    );
    return rowCount > 0;
  } catch (error) {
    console.error('Error deleting operation:', error);
    throw new Error('Database connection error');
  }
}

export async function deleteAllOperations(uid) {
  try {
    await pool.query('DELETE FROM operations WHERE uid = $1', [uid]);
  } catch (error) {
    console.error('Error deleting all operations:', error);
    throw new Error('Database connection error');
  }
} 