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
    // Accept optional source tracking for idempotency (e.g. fixed_operations)
    const { result, initialCapital, montoRb, finalCapital, kellyUsed, uid, source, sourceId } = data;

    // Build columns/values dynamically so we only insert provided fields
    const columns = ['result', 'initialCapital', 'montoRb', 'finalCapital', 'kellyUsed', 'uid'];
    const values = [result, initialCapital, montoRb, finalCapital, kellyUsed, uid];
    const placeholders = ['$1', '$2', '$3', '$4', '$5', '$6'];
    let idx = 7;

    if (source !== undefined) {
      columns.push('source');
      values.push(source);
      placeholders.push(`$${idx++}`);
    }
    if (sourceId !== undefined) {
      columns.push('source_id');
      values.push(sourceId);
      placeholders.push(`$${idx++}`);
    }

    // If source/source_id provided, use ON CONFLICT to avoid duplicates based on unique index
    let query = `INSERT INTO operations (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
    if (source !== undefined && sourceId !== undefined) {
      query += ` ON CONFLICT ON CONSTRAINT operations_source_unique_idx DO NOTHING RETURNING *`;
      const { rows } = await pool.query(query, values);
      if (rows && rows.length) return rows[0];
      // If conflict happened (no rows returned), fetch existing row
      const { rows: existing } = await pool.query(`SELECT * FROM operations WHERE source = $1 AND source_id = $2 AND uid = $3 LIMIT 1`, [source, sourceId, uid]);
      return existing[0];
    } else {
      query += ` RETURNING *`;
      const { rows } = await pool.query(query, values);
      return rows[0];
    }
  } catch (error) {
    console.error('Error creating operation:', error);
    throw new Error('Database connection error');
  }
}

// Convenience wrapper to create operation from an external source (idempotent)
export async function createOperationFromSource(data) {
  return createOperation(data);
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