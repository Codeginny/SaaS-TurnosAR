// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Configuración global para screenshots
Cypress.on('test:after:run', (attributes) => {
  // Tomar screenshot después de cada test
  if (attributes.state === 'passed') {
    cy.screenshot(`success-${attributes.title}`);
  } else if (attributes.state === 'failed') {
    cy.screenshot(`failure-${attributes.title}`);
  }
});

// Configuración para manejo de errores
Cypress.on('uncaught:exception', (err, runnable) => {
  // Retornar false para evitar que Cypress falle en errores no críticos
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});

// Configuración para timeouts más largos en desarrollo
if (Cypress.env('NODE_ENV') === 'development') {
  Cypress.config('defaultCommandTimeout', 15000);
  Cypress.config('requestTimeout', 15000);
  Cypress.config('responseTimeout', 15000);
}