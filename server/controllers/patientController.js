const { query } = require('../database/config');
const { updatePatientSchema } = require('../validators/schemas');

/**
 * @swagger
 * /api/patient/{id}:
 *   put:
 *     summary: Actualizar datos de paciente
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePatient'
 *     responses:
 *       200:
 *         description: Datos actualizados exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No autorizado para actualizar estos datos
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
// 📝 ACTUALIZAR DATOS DE PACIENTE
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // ID del usuario autenticado desde JWT
    
    // Validación de propiedad: un paciente solo puede actualizar sus propios datos
    if (req.user.role === 'patient' && parseInt(id) !== parseInt(userId)) {
      return res.status(403).json({ 
        error: 'No estás autorizado para actualizar los datos de otro paciente.' 
      });
    }

    const validationResult = updatePatientSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.errors 
      });
    }

    const { nombre, email, telefono, obraSocial, direccion, provincia, localidad, codigoPostal, grupoSangre, enfermedades, alergias } = validationResult.data;

    const checkPatient = await query(
      'SELECT id FROM pacientes WHERE id = $1',
      [parseInt(id)]
    );

    if (checkPatient.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Paciente no encontrado' 
      });
    }

    const result = await query(
      `UPDATE pacientes SET 
        nombre = $1,
        email = $2,
        telefono = $3,
        obra_social = $4,
        direccion = $5,
        provincia = $6,
        localidad = $7,
        codigo_postal = $8,
        grupo_sangre = $9,
        enfermedades = $10,
        alergias = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING id, dni, nombre, email, telefono, obra_social, direccion, provincia, localidad, codigo_postal, grupo_sangre, enfermedades, alergias, debe_cambiar_clave, estado, created_at, updated_at`,
      [nombre, email, telefono, obraSocial, direccion, provincia, localidad, codigoPostal, grupoSangre, enfermedades, alergias, parseInt(id)]
    );

    res.json({
      message: 'Datos actualizados exitosamente',
      paciente: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * @swagger
 * /api/patient/{id}:
 *   get:
 *     summary: Obtener perfil de paciente
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Perfil de paciente obtenido
 *       403:
 *         description: No autorizado para ver estos datos
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
// 📊 OBTENER PERFIL DE PACIENTE
const getPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // ID del usuario autenticado desde JWT
    
    // Validación de propiedad: un paciente solo puede ver sus propios datos
    if (req.user.role === 'patient' && parseInt(id) !== parseInt(userId)) {
      return res.status(403).json({ 
        error: 'No estás autorizado para ver los datos de otro paciente.' 
      });
    }
    
    const result = await query(
      'SELECT id, dni, nombre, email, telefono, obra_social, direccion, provincia, localidad, codigo_postal, grupo_sangre, enfermedades, alergias, debe_cambiar_clave, estado, created_at, updated_at FROM pacientes WHERE id = $1',
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Paciente no encontrado' 
      });
    }

    res.json({
      paciente: result.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener perfil de paciente:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * @swagger
 * /api/pacientes:
 *   get:
 *     summary: Obtener todos los pacientes
 *     tags: [Pacientes]
 *     responses:
 *       200:
 *         description: Lista de pacientes
 *       500:
 *         description: Error interno del servidor
 */
// 📊 OBTENER TODOS LOS PACIENTES
const getAllPatients = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, dni, nombre, email, telefono, obra_social, direccion, provincia, localidad, codigo_postal, grupo_sangre, enfermedades, alergias, debe_cambiar_clave, estado, created_at, updated_at FROM pacientes ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

module.exports = {
  updatePatient,
  getPatient,
  getAllPatients
};
