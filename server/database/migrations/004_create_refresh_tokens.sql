-- Migration: Crear tabla refresh_tokens
-- Fecha: 2026-04-28
-- Descripción: Tabla para almacenar refresh tokens seguros (HttpOnly cookies)

-- Crear tabla refresh_tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES pacientes(id) ON DELETE CASCADE
);

-- Índice para búsquedas rápidas por token
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- Índice para limpieza de tokens expirados
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Comentario sobre la tabla
COMMENT ON TABLE refresh_tokens IS 'Almacena refresh tokens seguros para renovación de sesiones';
COMMENT ON COLUMN refresh_tokens.user_id IS 'ID del usuario (paciente) asociado al token';
COMMENT ON COLUMN refresh_tokens.token IS 'Token de refresh (hash seguro)';
COMMENT ON COLUMN refresh_tokens.expires_at IS 'Fecha de expiración del refresh token (generalmente 7-30 días)';
COMMENT ON COLUMN refresh_tokens.revoked_at IS 'Fecha en que el token fue revocado (logout)';
