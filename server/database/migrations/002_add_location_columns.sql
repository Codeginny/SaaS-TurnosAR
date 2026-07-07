-- 🗄️ MIGRACIÓN 002: AGREGAR COLUMNAS DE UBICACIÓN A PROFESIONALES
-- Sistema TurnosAR - PostgreSQL
-- Fecha: 2026-04-27
-- Descripción: Agregar clinica, provincia, ciudad para distribución geográfica real

-- Agregar columna clinica
ALTER TABLE profesionales ADD COLUMN IF NOT EXISTS clinica VARCHAR(100);

-- Agregar columna provincia
ALTER TABLE profesionales ADD COLUMN IF NOT EXISTS provincia VARCHAR(100);

-- Agregar columna ciudad
ALTER TABLE profesionales ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100);

-- Comentarios para documentación
COMMENT ON COLUMN profesionales.clinica IS 'Clínica o sanatorio donde atiende el profesional';
COMMENT ON COLUMN profesionales.provincia IS 'Provincia de Argentina donde atiende';
COMMENT ON COLUMN profesionales.ciudad IS 'Ciudad donde atiende el profesional';
