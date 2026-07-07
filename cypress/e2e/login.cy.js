describe('Flujo de Login - TurnosAR', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/login');
    cy.waitForPageLoad();
    cy.screenshot('01-login-page-loaded');
  });

  it('Debería mostrar la página de login correctamente', () => {
    // Verificar elementos de la página
    cy.get('h1').should('contain', 'Iniciar Sesión');
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('be.visible');
    
    // Verificar accesibilidad
    cy.checkAccessibility();
    
    // Screenshot de la página completa
    cy.screenshot('02-login-page-elements-visible');
  });

  it('Debería validar campos requeridos', () => {
    // Intentar enviar formulario vacío
    cy.get('[data-testid="login-button"]').click();
    
    // Verificar mensajes de error
    cy.get('[data-testid="email-error"]').should('be.visible');
    cy.get('[data-testid="password-error"]').should('be.visible');
    
    cy.screenshot('03-validation-errors-displayed');
  });

  it('Debería permitir login exitoso como paciente', () => {
    // Datos de prueba
    const testEmail = 'paciente@test.com';
    const testPassword = '12345678';
    
    // Completar formulario
    cy.get('[data-testid="email-input"]').type(testEmail);
    cy.screenshot('04-email-entered');
    
    cy.get('[data-testid="password-input"]').type(testPassword);
    cy.screenshot('05-password-entered');
    
    // Enviar formulario
    cy.get('[data-testid="login-button"]').click();
    
    // Verificar redirección exitosa
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Dashboard');
    
    cy.screenshot('06-login-successful-dashboard');
  });

  it('Debería permitir login exitoso como profesional', () => {
    // Datos de prueba
    const testEmail = 'profesional@test.com';
    const testPassword = '12345678';
    
    // Completar formulario
    cy.get('[data-testid="email-input"]').clear().type(testEmail);
    cy.get('[data-testid="password-input"]').clear().type(testPassword);
    
    cy.screenshot('07-professional-credentials-entered');
    
    // Enviar formulario
    cy.get('[data-testid="login-button"]').click();
    
    // Verificar redirección exitosa
    cy.url().should('include', '/professional');
    cy.get('h1').should('contain', 'Dashboard del Profesional');
    
    cy.screenshot('08-professional-login-successful');
  });

  it('Debería mostrar error con credenciales inválidas', () => {
    // Datos inválidos
    const invalidEmail = 'invalid@test.com';
    const invalidPassword = 'wrongpassword';
    
    // Completar formulario con datos inválidos
    cy.get('[data-testid="email-input"]').type(invalidEmail);
    cy.get('[data-testid="password-input"]').type(invalidPassword);
    
    cy.screenshot('09-invalid-credentials-entered');
    
    // Enviar formulario
    cy.get('[data-testid="login-button"]').click();
    
    // Verificar mensaje de error
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Credenciales inválidas');
    
    cy.screenshot('10-invalid-credentials-error');
  });

  it('Debería mantener datos del formulario en caso de error', () => {
    // Completar formulario
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    cy.get('[data-testid="email-input"]').type(testEmail);
    cy.get('[data-testid="password-input"]').type(testPassword);
    
    // Simular error (por ejemplo, enviar formulario vacío)
    cy.get('[data-testid="email-input"]').clear();
    cy.get('[data-testid="login-button"]').click();
    
    // Verificar que el password se mantiene
    cy.get('[data-testid="password-input"]').should('have.value', testPassword);
    
    cy.screenshot('11-form-data-persisted');
  });

  it('Debería funcionar correctamente en modo oscuro', () => {
    // Cambiar a modo oscuro si existe el toggle
    cy.get('[data-testid="dark-mode-toggle"]').click().then(() => {
      // Verificar que el modo oscuro esté activo
      cy.get('body').should('have.class', 'dark');
      
      cy.screenshot('12-dark-mode-active');
      
      // Verificar que todos los elementos sean visibles
      cy.get('[data-testid="email-input"]').should('be.visible');
      cy.get('[data-testid="password-input"]').should('be.visible');
      cy.get('[data-testid="login-button"]').should('be.visible');
    });
  });

  afterEach(() => {
    // Generar reporte de cobertura
    cy.generateCoverageReport();
    
    // Verificar que no hay errores en consola
    cy.checkConsoleErrors();
  });
});