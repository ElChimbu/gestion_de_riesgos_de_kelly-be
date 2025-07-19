CREATE TABLE IF NOT EXISTS fixed_operations (
  id SERIAL PRIMARY KEY,
  result VARCHAR(10) NOT NULL CHECK (result IN ('Ganada', 'Perdida')),
  initialCapital NUMERIC NOT NULL,
  montoRb NUMERIC NOT NULL,
  finalCapital NUMERIC NOT NULL,
  riskPercentage NUMERIC NOT NULL
); 