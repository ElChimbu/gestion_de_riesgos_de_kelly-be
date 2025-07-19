// Ejemplo de peticiones para ambos endpoints

// Para operaciones Kelly (kellyUsed)
const kellyOperationPayload = {
  result: "Ganada",
  initialCapital: 2000,
  montoRb: 60,
  finalCapital: 2060,
  kellyUsed: 2
};

// Para operaciones de riesgo fijo (riskPercentage)
const fixedRiskOperationPayload = {
  result: "Ganada", 
  initialCapital: 2000, 
  montoRb: 60, 
  finalCapital: 2060, 
  riskPercentage: 2  // ← Cambiar kellyUsed por riskPercentage
};

// Ejemplo de petición fetch para operaciones de riesgo fijo
async function createFixedRiskOperation() {
  try {
    const response = await fetch('http://localhost:3000/api/fixed-operations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fixedRiskOperationPayload)
    });
    
    const data = await response.json();
    console.log('Respuesta:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejemplo de petición fetch para operaciones Kelly
async function createKellyOperation() {
  try {
    const response = await fetch('http://localhost:3000/api/operations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(kellyOperationPayload)
    });
    
    const data = await response.json();
    console.log('Respuesta:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

console.log('Payload para operaciones Kelly:', kellyOperationPayload);
console.log('Payload para operaciones de riesgo fijo:', fixedRiskOperationPayload); 