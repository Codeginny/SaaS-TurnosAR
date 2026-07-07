/**
 * Tests Unitarios de Autenticación - TurnosAR
 * 
 * Casos de prueba:
 * 1. Registro exitoso de paciente
 * 2. Error 400 al registrar DNI duplicado
 * 3. Verificación de que la contraseña NO se guarda en texto plano (bcrypt)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { query } from '../database/config.js';

describe('Autenticación - API Endpoints', () => {
  // Limpiar base de datos antes de los tests
  beforeAll(async () => {
    try {
      await query("DELETE FROM pacientes WHERE email LIKE '%test%'");
    } catch (error) {
      console.log('Error limpiando base de datos:', error);
    }
  });

  // Test 1: Registro exitoso de paciente
  it('debería registrar un paciente exitosamente', async () => {
    const newPatient = {
      nombre: 'Paciente Test',
      dni: '40000000',
      email: 'paciente.test@example.com',
      password: 'password123',
      telefono: '543834123456'
    };

    const response = await request(app)
      .post('/api/auth/register/patient')
      .send(newPatient)
      .expect(201);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('exitosamente');
    expect(response.body).toHaveProperty('paciente');
    expect(response.body.paciente).toHaveProperty('id');
    expect(response.body.paciente).toHaveProperty('email', newPatient.email);
    expect(response.body.paciente).toHaveProperty('dni', newPatient.dni);
    expect(response.body.paciente).not.toHaveProperty('password'); // Password no debe devolverse
  });

  // Test 2: Error 400 al registrar DNI duplicado
  it('debería retornar error 400 al intentar registrar un DNI duplicado', async () => {
    const duplicatePatient = {
      nombre: 'Paciente Duplicado',
      dni: '40000000', // Mismo DNI que el test anterior
      email: 'otro.email@example.com',
      password: 'password456',
      telefono: '543834654321'
    };

    const response = await request(app)
      .post('/api/auth/register/patient')
      .send(duplicatePatient)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('ya existe');
  });

  // Test 3: Verificación de que la contraseña NO se guarda en texto plano
  it('debería hashear la contraseña con bcrypt (no guardar en texto plano)', async () => {
    const testPatient = {
      nombre: 'Paciente Hash Test',
      dni: '40000001',
      email: 'hash.test@example.com',
      password: 'password123',
      telefono: '543834999888'
    };

    // Registrar paciente
    await request(app)
      .post('/api/auth/register/patient')
      .send(testPatient)
      .expect(201);

    // Consultar base de datos directamente para verificar el hash
    const result = await query(
      'SELECT password FROM pacientes WHERE dni = $1',
      [testPatient.dni]
    );

    expect(result.rows.length).toBeGreaterThan(0);
    const storedPassword = result.rows[0].password;

    // Verificar que NO es la contraseña en texto plano
    expect(storedPassword).not.toBe(testPatient.password);
    
    // Verificar que tiene el formato de bcrypt (60 caracteres, comienza con $2b$)
    expect(storedPassword).toHaveLength(60);
    expect(storedPassword).toMatch(/^\$2b\$/);
  });

  // Test 4: Login exitoso con credenciales correctas
  it('debería iniciar sesión exitosamente con credenciales correctas', async () => {
    const loginData = {
      email: 'paciente.test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login/patient')
      .send(loginData)
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('paciente');
    expect(response.body.paciente).toHaveProperty('email', loginData.email);
    expect(response.body.token).toBeTruthy(); // Token debe existir
  });

  // Test 5: Error 401 con credenciales incorrectas
  it('debería retornar error 401 con credenciales incorrectas', async () => {
    const wrongCredentials = {
      email: 'paciente.test@example.com',
      password: 'wrongpassword'
    };

    const response = await request(app)
      .post('/api/auth/login/patient')
      .send(wrongCredentials)
      .expect(401);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Credenciales');
  });

  // Limpiar después de los tests
  afterAll(async () => {
    try {
      await query("DELETE FROM pacientes WHERE email LIKE '%test%'");
    } catch (error) {
      console.log('Error limpiando base de datos después de tests:', error);
    }
  });
});
