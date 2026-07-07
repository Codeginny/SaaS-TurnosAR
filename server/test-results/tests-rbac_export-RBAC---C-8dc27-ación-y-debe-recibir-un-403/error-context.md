# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/rbac_export.spec.js >> RBAC - Control de Acceso a Exportación Financiera >> Escenario C: Un paciente no debe poder acceder al endpoint de exportación y debe recibir un 403
- Location: tests/rbac_export.spec.js:9:3

# Error details

```
Error: apiRequestContext.get: connect ECONNREFUSED 127.0.0.1:3001
Call log:
  - → GET http://localhost:3001/api/stats/export?range=year
    - user-agent: Playwright/1.61.1 (x64; ubuntu 24.04) node/18.19
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5OSwicm9sZSI6InBhdGllbnQiLCJpYXQiOjE3ODI1Njk0NDcsImV4cCI6MTc4MjU3MzA0N30.mS3UrhfK-H4D90kY2Q8MHBsFoUnjHURq3BhjzIOLWx4

```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | const jwt = require('jsonwebtoken');
  3  | 
  4  | // Usamos el mismo secreto que en tu .env para poder firmar un token válido
  5  | const JWT_SECRET = process.env.JWT_SECRET || 'turnosar_secret_key_2024_development';
  6  | 
  7  | test.describe('RBAC - Control de Acceso a Exportación Financiera', () => {
  8  |   
  9  |   test('Escenario C: Un paciente no debe poder acceder al endpoint de exportación y debe recibir un 403', async ({ request }) => {
  10 |     
  11 |     // 1. Arrange: Simulamos la sesión de un paciente generando un JWT válido manualmente
  12 |     // Esto evita tener que hacer el flujo completo de UI/Login, haciendo el test más rápido y robusto
  13 |     const mockPatientPayload = {
  14 |       id: 9999, // ID ficticio
  15 |       role: 'patient' // El rol crítico que debe ser rechazado
  16 |     };
  17 |     
  18 |     const patientToken = jwt.sign(mockPatientPayload, JWT_SECRET, { expiresIn: '1h' });
  19 |     
  20 |     // 2. Act: Realizamos la petición GET directa al endpoint protegido
> 21 |     const response = await request.get('http://localhost:3001/api/stats/export?range=year', {
     |                                    ^ Error: apiRequestContext.get: connect ECONNREFUSED 127.0.0.1:3001
  22 |       headers: {
  23 |         'Authorization': `Bearer ${patientToken}`
  24 |       }
  25 |     });
  26 | 
  27 |     // 3. Assert: Verificamos que el middleware de autorización interceptó y bloqueó la petición
  28 |     expect(response.status()).toBe(403);
  29 |     
  30 |     // Verificamos opcionalmente que el mensaje de error sea el esperado (según tu authorize middleware)
  31 |     const body = await response.json();
  32 |     expect(body).toHaveProperty('error');
  33 |     expect(body.error).toContain('Acceso denegado');
  34 |   });
  35 | 
  36 | });
  37 | 
```