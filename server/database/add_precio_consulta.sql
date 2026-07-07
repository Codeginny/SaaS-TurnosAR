-- Agregar columna precio_consulta a la tabla de turnos
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS precio_consulta NUMERIC(10, 2) DEFAULT 5000;

-- Agregar índice para mejorar rendimiento en consultas de estadísticas
CREATE INDEX IF NOT EXISTS idx_turnos_professional_id ON turnos(profesional_id);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(fecha);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);

-- Comentario para documentación
COMMENT ON COLUMN turnos.precio_consulta IS 'Precio de la consulta en pesos argentinos. Valor por defecto: 5000';
