-- Migration: Agregar columnas faltantes en tabla turnos detectadas por inconsistencia con el controlador
-- Fecha: 2026-04-30
-- Descripción: Agrega campos de desnormalización del paciente y profesional para facilitar consultas y reportes

ALTER TABLE turnos 
ADD COLUMN IF NOT EXISTS paciente_dni INTEGER,
ADD COLUMN IF NOT EXISTS paciente_nombre VARCHAR(100),
ADD COLUMN IF NOT EXISTS paciente_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS paciente_telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS profesional VARCHAR(100),
ADD COLUMN IF NOT EXISTS precio_consulta DECIMAL(10,2) DEFAULT 30000.00;

-- Asegurar que created_at sea el nombre estándar (algunos scripts usan createdat)
-- Si ya existe created_at, no hace nada.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='turnos' AND column_name='createdat') THEN
        -- No hacemos nada, usamos created_at que ya existe por 001
    END IF;
END $$;
