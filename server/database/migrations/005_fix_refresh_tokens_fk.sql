-- Migration: Fix foreign key constraint in refresh_tokens
-- Fecha: 2026-04-28
-- Descripción: Eliminar foreign key restrictivo para permitir refresh tokens para pacientes y profesionales

-- Eliminar el foreign key restrictivo
ALTER TABLE refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_user_id_fkey;

-- No agregamos un nuevo foreign key porque user_id puede referenciar tanto pacientes como profesionales
-- La integridad referencial se maneja a nivel de aplicación
