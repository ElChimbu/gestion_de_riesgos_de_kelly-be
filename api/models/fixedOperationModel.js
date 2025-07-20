import pool from '../db.js';

// Función para transformar snake_case a camelCase y convertir strings numéricos a números
function mapFixedOperationRow(row) {
  return {
    id: row.id,
    result: row.result,
    initialCapital: Number(row.initialcapital),
    montoRb: Number(row.montorb),
    finalCapital: Number(row.finalcapital),
    riskPercentage: Number(row.riskpercentage),
    fechaHoraApertura: row.fechahoraapertura ? row.fechahoraapertura : null,
    fechaHoraCierre: row.fechahoracierre ? row.fechahoracierre : null,
    observaciones: row.observaciones || null,
    imagenUrl: row.imagen_url || null
  };
}

export async function getAllFixedOperations() {
  try {
    const { rows } = await pool.query('SELECT * FROM fixed_operations ORDER BY id ASC');
    return rows.map(mapFixedOperationRow);
  } catch (error) {
    console.error('Error getting fixed operations:', error);
    throw new Error('Database connection error');
  }
}

export async function createFixedOperation(data) {
  try {
    // Extrae solo los campos válidos, ignora cualquier 'id' recibido
    let { result, initialCapital, montoRb, finalCapital, riskPercentage, fechaHoraApertura, fechaHoraCierre, observaciones, imagenUrl } = data;
    // Convertir strings vacíos a null
    fechaHoraApertura = (fechaHoraApertura === '' ? null : fechaHoraApertura);
    fechaHoraCierre = (fechaHoraCierre === '' ? null : fechaHoraCierre);
    observaciones = (observaciones === '' ? null : observaciones);
    imagenUrl = (imagenUrl === '' ? null : imagenUrl);
    const columns = ['result', 'initialCapital', 'montoRb', 'finalCapital', 'riskPercentage'];
    const values = [result, initialCapital, montoRb, finalCapital, riskPercentage];
    const placeholders = ['$1', '$2', '$3', '$4', '$5'];
    let idx = 6;
    if (fechaHoraApertura !== undefined) {
      columns.push('fecha_hora_apertura');
      values.push(fechaHoraApertura);
      placeholders.push(`$${idx++}`);
    }
    if (fechaHoraCierre !== undefined) {
      columns.push('fecha_hora_cierre');
      values.push(fechaHoraCierre);
      placeholders.push(`$${idx++}`);
    }
    if (observaciones !== undefined) {
      columns.push('observaciones');
      values.push(observaciones);
      placeholders.push(`$${idx++}`);
    }
    if (imagenUrl !== undefined) {
      columns.push('imagen_url');
      values.push(imagenUrl);
      placeholders.push(`$${idx++}`);
    }
    const query = `INSERT INTO fixed_operations (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
    const { rows } = await pool.query(query, values);
    // Devuelve el objeto en camelCase y con números
    return mapFixedOperationRow(rows[0]);
  } catch (error) {
    console.error('Error creating fixed operation:', error);
    throw new Error('Database connection error');
  }
}

export async function updateFixedOperation(id, data) {
  try {
    // Convertir strings vacíos a null en los campos opcionales
    let { fechaHoraApertura, fechaHoraCierre, observaciones, imagenUrl } = data;
    fechaHoraApertura = (fechaHoraApertura === '' ? null : fechaHoraApertura);
    fechaHoraCierre = (fechaHoraCierre === '' ? null : fechaHoraCierre);
    observaciones = (observaciones === '' ? null : observaciones);
    imagenUrl = (imagenUrl === '' ? null : imagenUrl);
    const set = ['result = $1', 'initialCapital = $2', 'montoRb = $3', 'finalCapital = $4', 'riskPercentage = $5'];
    const values = [data.result, data.initialCapital, data.montoRb, data.finalCapital, data.riskPercentage];
    let idx = 6;
    if (fechaHoraApertura !== undefined) {
      set.push(`fecha_hora_apertura = $${idx}`);
      values.push(fechaHoraApertura);
      idx++;
    }
    if (fechaHoraCierre !== undefined) {
      set.push(`fecha_hora_cierre = $${idx}`);
      values.push(fechaHoraCierre);
      idx++;
    }
    if (observaciones !== undefined) {
      set.push(`observaciones = $${idx}`);
      values.push(observaciones);
      idx++;
    }
    if (imagenUrl !== undefined) {
      set.push(`imagen_url = $${idx}`);
      values.push(imagenUrl);
      idx++;
    }
    values.push(id);
    const query = `UPDATE fixed_operations SET ${set.join(', ')} WHERE id = $${idx} RETURNING *`;
    const { rows } = await pool.query(query, values);
    return mapFixedOperationRow(rows[0]);
  } catch (error) {
    console.error('Error updating fixed operation:', error);
    throw new Error('Database connection error');
  }
}

export async function deleteFixedOperation(id) {
  try {
    await pool.query('DELETE FROM fixed_operations WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting fixed operation:', error);
    throw new Error('Database connection error');
  }
}

export async function deleteAllFixedOperations() {
  try {
    await pool.query('DELETE FROM fixed_operations');
  } catch (error) {
    console.error('Error deleting all fixed operations:', error);
    throw new Error('Database connection error');
  }
}

export async function getFixedOperationsStats() {
  try {
    const { rows } = await pool.query(`
      SELECT 
        COUNT(*) as totalOperations,
        COUNT(CASE WHEN result = 'Ganada' THEN 1 END) as wins,
        COUNT(CASE WHEN result = 'Perdida' THEN 1 END) as losses,
        ROUND(
          (COUNT(CASE WHEN result = 'Ganada' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2
        ) as winrate
      FROM fixed_operations
    `);
    return rows[0];
  } catch (error) {
    console.error('Error getting fixed operations stats:', error);
    throw new Error('Database connection error');
  }
} 