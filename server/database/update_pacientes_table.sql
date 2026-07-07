-- Actualizar tabla pacientes para recuperación de contraseña
-- Agregar columnas para tokens de restablecimiento

-- Agregar columnas si no existen
ALTER TABLE pacientes 
ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE;

-- Crear índice para mejorar el rendimiento en búsquedas por token
CREATE INDEX IF NOT EXISTS idx_pacientes_reset_token ON pacientes(reset_password_token);

-- Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pacientes' 
ORDER BY ordinal_position;

-- Mostrar algunos registros para verificar
SELECT id, dni, nombre, email, reset_password_token, reset_password_expires 
FROM pacientes 
LIMIT 5;
