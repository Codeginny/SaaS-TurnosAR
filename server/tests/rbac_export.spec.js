const { test, expect } = require('@playwright/test');
const jwt = require('jsonwebtoken');

// Usamos el mismo secreto que en tu .env para poder firmar un token válido
const JWT_SECRET = process.env.JWT_SECRET || 'turnosar_secret_key_2024_development';

test.describe('RBAC - Control de Acceso a Exportación Financiera', () => {
  
  test('Escenario C: Un paciente no debe poder acceder al endpoint de exportación y debe recibir un 403', async ({ request }) => {
    
    // 1. Arrange: Simulamos la sesión de un paciente generando un JWT válido manualmente
    // Esto evita tener que hacer el flujo completo de UI/Login, haciendo el test más rápido y robusto
    const mockPatientPayload = {
      id: 9999, // ID ficticio
      role: 'patient' // El rol crítico que debe ser rechazado
    };
    
    const patientToken = jwt.sign(mockPatientPayload, JWT_SECRET, { expiresIn: '1h' });
    
    // 2. Act: Realizamos la petición GET directa al endpoint protegido
    const response = await request.get('http://localhost:3001/api/stats/export?range=year', {
      headers: {
        'Authorization': `Bearer ${patientToken}`
      }
    });

    // 3. Assert: Verificamos que el middleware de autorización interceptó y bloqueó la petición
    expect(response.status()).toBe(403);
    
    // Verificamos opcionalmente que el mensaje de error sea el esperado (según tu authorize middleware)
    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toContain('Acceso denegado');
  });

});
