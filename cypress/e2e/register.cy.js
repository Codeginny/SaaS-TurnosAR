describe('Flujo de Registro - TurnosAR', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/register');
    cy.waitForPageLoad();
    cy.screenshot('01-register-page-loaded');
  });

  it('Debería mostrar la página de registro correctamente', () => {
    // Verificar elementos de la página
    cy.get('h1').should('contain', 'Registro');
    cy.get('[data-testid="name-input"]').should('be.visible');
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="phone-input"]').should('be.visible');
    cy.get('[data-testid="dni-input"]').should('be.visible');
    cy.get('[data-testid="register-button"]').should('be.visible');
    
    // Verificar accesibilidad
    cy.checkAccessibility();
    
    cy.screenshot('02-register-page-elements-visible');
  });

  it('Debería validar campos requeridos', () => {
    // Intentar enviar formulario vacío
    cy.get('[data-testid="register-button"]').click();
    
    // Verificar mensajes de error
    cy.get('[data-testid="name-error"]').should('be.visible');
    cy.get('[data-testid="email-error"]').should('be.visible');
    cy.get('[data-testid="phone-error"]').should('be.visible');
    cy.get('[data-testid="dni-error"]').should('be.visible');
    
    cy.screenshot('03-validation-errors-displayed');
  });

  it('Debería validar formato de email', () => {
    // Email inválido
    cy.get('[data-testid="email-input"]').type('invalid-email');
    cy.get('[data-testid="register-button"]').click();
    
    // Verificar mensaje de error de email
    cy.get('[data-testid="email-error"]').should('contain', 'Email inválido');
    
    cy.screenshot('04-email-format-validation');
    
    // Limpiar y probar email válido
    cy.get('[data-testid="email-input"]').clear().type('valid@email.com');
    cy.get('[data-testid="email-error"]').should('not.exist');
  });

  it('Debería validar formato de DNI', () => {
    // DNI inválido (muy corto)
    cy.get('[data-testid="dni-input"]').type('123');
    cy.get('[data-testid="register-button"]').click();
    
    // Verificar mensaje de error de DNI
    cy.get('[data-testid="dni-error"]').should('contain', 'DNI debe tener 8 dígitos');
    
    cy.screenshot('05-dni-format-validation');
    
    // Limpiar y probar DNI válido
    cy.get('[data-testid="dni-input"]').clear().type('12345678');
    cy.get('[data-testid="dni-error"]').should('not.exist');
  });

  it('Debería permitir registro exitoso de paciente', () => {
    // Datos de prueba válidos
    const patientData = {
      name: 'Juan Pérez',
      email: 'juan.perez@test.com',
      phone: '1234567890',
      dni: '87654321'
    };
    
    // Completar formulario paso a paso
    cy.get('[data-testid="name-input"]').type(patientData.name);
    cy.screenshot('06-name-entered');
    
    cy.get('[data-testid="email-input"]').type(patientData.email);
    cy.screenshot('07-email-entered');
    
    cy.get('[data-testid="phone-input"]').type(patientData.phone);
    cy.screenshot('08-phone-entered');
    
    cy.get('[data-testid="dni-input"]').type(patientData.dni);
    cy.screenshot('09-dni-entered');
    
    // Enviar formulario
    cy.get('[data-testid="register-button"]').click();
    
    // Verificar mensaje de éxito
    cy.get('[data-testid="success-message"]').should('be.visible');
    cy.get('[data-testid="success-message"]').should('contain', 'Registro exitoso');
    
    cy.screenshot('10-registration-successful');
  });

  it('Debería mostrar error si el email ya existe', () => {
    // Usar email que ya existe
    const existingEmail = 'paciente@test.com';
    
    cy.get('[data-testid="name-input"]').type('Test User');
    cy.get('[data-testid="email-input"]').type(existingEmail);
    cy.get('[data-testid="phone-input"]').type('1234567890');
    cy.get('[data-testid="dni-input"]').type('11111111');
    
    cy.screenshot('11-existing-email-entered');
    
    // Enviar formulario
    cy.get('[data-testid="register-button"]').click();
    
    // Verificar mensaje de error
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Email ya registrado');
    
    cy.screenshot('12-existing-email-error');
  });

  it('Debería mostrar error si el DNI ya existe', () => {
    // Usar DNI que ya existe
    const existingDNI = '12345678';
    
    cy.get('[data-testid="name-input"]').type('Test User');
    cy.get('[data-testid="email-input"]').type('new@test.com');
    cy.get('[data-testid="phone-input"]').type('1234567890');
    cy.get('[data-testid="dni-input"]').type(existingDNI);
    
    cy.screenshot('13-existing-dni-entered');
    
    // Enviar formulario
    cy.get('[data-testid="register-button"]').click();
    
    // Verificar mensaje de error
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'DNI ya registrado');
    
    cy.screenshot('14-existing-dni-error');
  });

  it('Debería limpiar formulario después de registro exitoso', () => {
    // Completar formulario
    cy.get('[data-testid="name-input"]').type('Test User');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="phone-input"]').type('1234567890');
    cy.get('[data-testid="dni-input"]').type('99999999');
    
    // Enviar formulario
    cy.get('[data-testid="register-button"]').click();
    
    // Verificar que los campos estén limpios
    cy.get('[data-testid="name-input"]').should('have.value', '');
    cy.get('[data-testid="email-input"]').should('have.value', '');
    cy.get('[data-testid="phone-input"]').should('have.value', '');
    cy.get('[data-testid="dni-input"]').should('have.value', '');
    
    cy.screenshot('15-form-cleared-after-success');
  });

  it('Debería funcionar correctamente en modo oscuro', () => {
    // Cambiar a modo oscuro si existe el toggle
    cy.get('[data-testid="dark-mode-toggle"]').click().then(() => {
      // Verificar que el modo oscuro esté activo
      cy.get('body').should('have.class', 'dark');
      
      cy.screenshot('16-dark-mode-active');
      
      // Verificar que todos los elementos sean visibles
      cy.get('[data-testid="name-input"]').should('be.visible');
      cy.get('[data-testid="email-input"]').should('be.visible');
      cy.get('[data-testid="phone-input"]').should('be.visible');
      cy.get('[data-testid="dni-input"]').should('be.visible');
      cy.get('[data-testid="register-button"]').should('be.visible');
    });
  });

  afterEach(() => {
    // Generar reporte de cobertura
    cy.generateCoverageReport();
    
    // Verificar que no hay errores en consola
    cy.checkConsoleErrors();
  });
});
