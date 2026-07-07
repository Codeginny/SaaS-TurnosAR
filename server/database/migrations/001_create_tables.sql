-- 🗄️ MIGRACIÓN 001: CREAR TABLAS PRINCIPALES
-- Sistema TurnosAR - PostgreSQL
-- Fecha: 2024-10-13
-- Descripción: Crear tablas de pacientes y profesionales con seguridad Bcrypt

-- Crear extensión para UUIDs (opcional, para IDs únicos)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: PROFESIONALES
-- =============================================
CREATE TABLE IF NOT EXISTS profesionales (
    id SERIAL PRIMARY KEY,
    dni INTEGER UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Hash de Bcrypt (60 caracteres)
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    matricula VARCHAR(50),
    cuit VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(100),
    provincia VARCHAR(100),
    codigo_postal VARCHAR(10),
    estado VARCHAR(20) DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: PACIENTES
-- =============================================
CREATE TABLE IF NOT EXISTS pacientes (
    id SERIAL PRIMARY KEY,
    dni INTEGER UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Hash de Bcrypt (60 caracteres)
    nombre VARCHAR(100) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    telefono VARCHAR(20) DEFAULT '',
    obra_social VARCHAR(100),
    direccion TEXT,
    provincia VARCHAR(100),
    localidad VARCHAR(100),
    codigo_postal VARCHAR(10),
    grupo_sangre VARCHAR(5),
    enfermedades TEXT,
    alergias TEXT,
    debe_cambiar_clave BOOLEAN DEFAULT TRUE, -- Campo de seguridad
    estado VARCHAR(20) DEFAULT 'pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: TURNOS (Futuro)
-- =============================================
CREATE TABLE IF NOT EXISTS turnos (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
    profesional_id INTEGER REFERENCES profesionales(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    clinica VARCHAR(100),
    provincia VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'pendiente',
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para profesionales
CREATE INDEX IF NOT EXISTS idx_profesionales_dni ON profesionales(dni);
CREATE INDEX IF NOT EXISTS idx_profesionales_email ON profesionales(email);
CREATE INDEX IF NOT EXISTS idx_profesionales_especialidad ON profesionales(especialidad);
CREATE INDEX IF NOT EXISTS idx_profesionales_estado ON profesionales(estado);

-- Índices para pacientes
CREATE INDEX IF NOT EXISTS idx_pacientes_dni ON pacientes(dni);
CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);
CREATE INDEX IF NOT EXISTS idx_pacientes_estado ON pacientes(estado);
CREATE INDEX IF NOT EXISTS idx_pacientes_debe_cambiar_clave ON pacientes(debe_cambiar_clave);

-- Índices para turnos
CREATE INDEX IF NOT EXISTS idx_turnos_paciente_id ON turnos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_turnos_profesional_id ON turnos(profesional_id);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(fecha);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para profesionales
CREATE TRIGGER update_profesionales_updated_at 
    BEFORE UPDATE ON profesionales 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para pacientes
CREATE TRIGGER update_pacientes_updated_at 
    BEFORE UPDATE ON pacientes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para turnos
CREATE TRIGGER update_turnos_updated_at 
    BEFORE UPDATE ON turnos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMENTARIOS EN TABLAS
-- =============================================

COMMENT ON TABLE profesionales IS 'Tabla de profesionales médicos con autenticación segura';
COMMENT ON TABLE pacientes IS 'Tabla de pacientes con autenticación segura y gestión de perfil';
COMMENT ON TABLE turnos IS 'Tabla de turnos médicos con relaciones a pacientes y profesionales';

COMMENT ON COLUMN profesionales.password IS 'Hash de contraseña generado con Bcrypt (60 caracteres)';
COMMENT ON COLUMN pacientes.password IS 'Hash de contraseña generado con Bcrypt (60 caracteres)';
COMMENT ON COLUMN pacientes.debe_cambiar_clave IS 'Indica si el paciente debe cambiar su contraseña inicial';

-- =============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =============================================

-- Insertar profesional de prueba (contraseña: 'password123')
INSERT INTO profesionales (dni, password, nombre, email, telefono, especialidad, matricula, cuit, direccion, ciudad, provincia, codigo_postal) 
VALUES (
    12345678, 
    '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 
    'Dr. Juan Pérez', 
    'juan@email.com', 
    '011-1234-5678', 
    'Cardiología', 
    'MP-12345', 
    '20-12345678-9', 
    'Av. Corrientes 1234', 
    'Buenos Aires', 
    'CABA', 
    '1043'
) ON CONFLICT (dni) DO NOTHING;

-- Insertar paciente de prueba (contraseña: DNI como hash)
INSERT INTO pacientes (dni, password, nombre, email, telefono, debe_cambiar_clave) 
VALUES (
    87654321, 
    '$2b$10$sRZ9L0wM3nO4pP5rS6tU7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pP8rS9tU', 
    'María González López', 
    'maria@email.com', 
    '011-8765-4321', 
    false
) ON CONFLICT (dni) DO NOTHING;

-- =============================================
-- VERIFICACIÓN DE MIGRACIÓN
-- =============================================

-- Verificar que las tablas se crearon correctamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('profesionales', 'pacientes', 'turnos')
ORDER BY table_name, ordinal_position;

-- Verificar índices creados
SELECT 
    indexname, 
    tablename, 
    indexdef
FROM pg_indexes 
WHERE tablename IN ('profesionales', 'pacientes', 'turnos')
ORDER BY tablename, indexname;
