-- Crear tabla de turnos médicos
CREATE TABLE IF NOT EXISTS turnos (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    paciente_dni INTEGER NOT NULL,
    paciente_nombre VARCHAR(255),
    paciente_email VARCHAR(255),
    paciente_telefono VARCHAR(15),
    provincia VARCHAR(100) NOT NULL,
    clinica VARCHAR(255) NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    profesional VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(50) DEFAULT 'confirmado',
    observaciones TEXT,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_turnos_paciente_id ON turnos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(fecha);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);

-- Insertar algunos turnos de prueba
INSERT INTO turnos (
    paciente_id, 
    paciente_dni, 
    paciente_nombre, 
    paciente_email, 
    paciente_telefono,
    provincia, 
    clinica, 
    especialidad, 
    profesional, 
    fecha, 
    hora, 
    estado
) VALUES 
(4, 20308456, 'Laura Patricia Zurita', 'zurita123@gmail.com', '543834721234', 'Buenos Aires', 'Clínica Santa María', 'Cardiología', 'Dr. Juan Pérez', '2025-10-20', '10:00:00', 'confirmado'),
(4, 20308456, 'Laura Patricia Zurita', 'zurita123@gmail.com', '543834721234', 'Buenos Aires', 'Centro Médico San José', 'Dermatología', 'Dra. María González', '2025-10-25', '14:30:00', 'confirmado');

-- Mostrar los turnos creados
SELECT * FROM turnos ORDER BY createdat DESC;
