-- Migration: Agregar columnas para soporte de Obras Sociales en tabla turnos
-- Fecha: 2026-04-27
-- Descripción: Agrega campos para distinguir entre pacientes particulares y obra social

-- Agregar columnas a la tabla turnos
ALTER TABLE turnos 
ADD COLUMN IF NOT EXISTS tipo_cobertura VARCHAR(20) DEFAULT 'particular', -- 'particular' o 'obra_social'
ADD COLUMN IF NOT EXISTS obra_social_id INTEGER,
ADD COLUMN IF NOT EXISTS nro_afiliado VARCHAR(50),
ADD COLUMN IF NOT EXISTS estado_validacion VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'validado', 'rechazado'
ADD COLUMN IF NOT EXISTS token_validacion VARCHAR(10), -- Se llena recién en recepción
ADD COLUMN IF NOT EXISTS monto_sena DECIMAL(10,2) DEFAULT 10000.00, -- Monto de la seña para obra social
ADD COLUMN IF NOT EXISTS status_sena VARCHAR(20) DEFAULT 'cobrada', -- 'cobrada', 'reintegrada', 'retenida'
ADD COLUMN IF NOT EXISTS mercado_pago_id VARCHAR(100); -- ID del pago en Mercado Pago

-- Comentario sobre las columnas
COMMENT ON COLUMN turnos.tipo_cobertura IS 'Tipo de cobertura del paciente: particular o obra_social';
COMMENT ON COLUMN turnos.obra_social_id IS 'ID de la obra social (si aplica)';
COMMENT ON COLUMN turnos.nro_afiliado IS 'Número de afiliado del paciente (si aplica)';
COMMENT ON COLUMN turnos.estado_validacion IS 'Estado de validación de la obra social: pendiente, validado, rechazado';
COMMENT ON COLUMN turnos.token_validacion IS 'Token de validación generado en recepción (6 dígitos)';
COMMENT ON COLUMN turnos.monto_sena IS 'Monto de la seña de compromiso para pacientes con obra social (default: $10.000)';
COMMENT ON COLUMN turnos.status_sena IS 'Estado de la seña: cobrada (pagada), reintegrada (devuelta), retenida (no asistió)';
COMMENT ON COLUMN turnos.mercado_pago_id IS 'ID del pago en Mercado Pago para rastreo de reembolsos';
