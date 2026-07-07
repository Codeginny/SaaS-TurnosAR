// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Comando para login de paciente
Cypress.Commands.add('loginAsPatient', (email = 'paciente@test.com', password = '12345678') => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});

// Comando para login de profesional
Cypress.Commands.add('loginAsProfessional', (email = 'profesional@test.com', password = '12345678') => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/professional');
});

// Comando para registro de paciente
Cypress.Commands.add('registerPatient', (patientData) => {
  cy.visit('/register');
  cy.get('[data-testid="name-input"]').type(patientData.name);
  cy.get('[data-testid="email-input"]').type(patientData.email);
  cy.get('[data-testid="phone-input"]').type(patientData.phone);
  cy.get('[data-testid="dni-input"]').type(patientData.dni);
  cy.get('[data-testid="register-button"]').click();
});

// Comando para crear turno
Cypress.Commands.add('createAppointment', (appointmentData) => {
  cy.visit('/appointment');
  cy.get('[data-testid="specialty-select"]').select(appointmentData.specialty);
  cy.get('[data-testid="date-input"]').type(appointmentData.date);
  cy.get('[data-testid="time-select"]').select(appointmentData.time);
  cy.get('[data-testid="submit-button"]').click();
});

// Comando para tomar screenshot con timestamp
Cypress.Commands.add('screenshotWithTimestamp', (name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  cy.screenshot(`${name}-${timestamp}`);
});

// Comando para esperar que la página esté completamente cargada
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible');
  cy.window().should('have.property', 'document').its('readyState').should('eq', 'complete');
});

// Comando para limpiar localStorage antes de cada test
Cypress.Commands.add('clearLocalStorage', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
  });
});

// Comando para verificar que no hay errores en consola
Cypress.Commands.add('checkConsoleErrors', () => {
  cy.window().then((win) => {
    const consoleErrors = win.console.error;
    expect(consoleErrors).to.not.be.called;
  });
});

// Comando para verificar accesibilidad básica
Cypress.Commands.add('checkAccessibility', () => {
  cy.get('button').should('have.attr', 'aria-label').or('have.text');
  cy.get('img').should('have.attr', 'alt');
  cy.get('form').should('have.attr', 'aria-label');
});

// Comando para generar reporte de cobertura
Cypress.Commands.add('generateCoverageReport', () => {
  cy.task('log', 'Generando reporte de cobertura...');
  cy.task('table', {
    'Tests ejecutados': Cypress.env('testCount') || 0,
    'Screenshots generados': Cypress.env('screenshotCount') || 0,
    'Videos generados': Cypress.env('videoCount') || 0,
    'Fecha': new Date().toISOString()
  });
});