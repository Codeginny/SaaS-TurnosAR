describe('Flujo de Creación de Turnos - TurnosAR', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    // Login como paciente antes de crear turno
    cy.loginAsPatient();
    cy.visit('/appointment');
    cy.waitForPageLoad();
    cy.screenshot('01-appointment-page-loaded');
  });

  it('Debería mostrar la página de creación de turnos correctamente', () => {
    // Verificar elementos de la página
    cy.get('h1').should('contain', 'Solicitar Turno');
    cy.get('[data-testid="specialty-select"]').should('be.visible');
    cy.get('[data-testid="date-input"]').should('be.visible');
    cy.get('[data-testid="time-select"]').should('be.visible');
    cy.get('[data-testid="submit-button"]').should('be.visible');
    
    // Verificar accesibilidad
    cy.checkAccessibility();
    
    cy.screenshot('02-appointment-page-elements-visible');
  });

  it('Debería mostrar especialidades disponibles', () => {
    // Verificar que el select de especialidades tenga opciones
    cy.get('[data-testid="specialty-select"]').should('have.length.greaterThan', 0);
    
    // Verificar opciones específicas
    cy.get('[data-testid="specialty-select"] option').should('contain', 'Cardiología');
    cy.get('[data-testid="specialty-select"] option').should('contain', 'Dermatología');
    cy.get('[data-testid="specialty-select"] option').should('contain', 'Traumatología');
    
    cy.screenshot('03-specialties-available');
  });

  it('Debería validar campos requeridos', () => {
    // Intentar enviar formulario vacío
    cy.get('[data-testid="submit-button"]').click();
    
    // Verificar mensajes de error
    cy.get('[data-testid="specialty-error"]').should('be.visible');
    cy.get('[data-testid="date-error"]').should('be.visible');
    cy.get('[data-testid="time-error"]').should('be.visible');
    
    cy.screenshot('04-validation-errors-displayed');
  });

  it('Debería validar fecha futura', () => {
    // Fecha pasada
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const pastDateString = pastDate.toISOString().split('T')[0];
    
    cy.get('[data-testid="date-input"]').type(pastDateString);
    cy.get('[data-testid="submit-button"]').click();
    
    // Verificar mensaje de error
    cy.get('[data-testid="date-error"]').should('contain', 'La fecha debe ser futura');
    
    cy.screenshot('05-past-date-validation');
    
    // Limpiar y probar fecha futura
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    cy.get('[data-testid="date-input"]').clear().type(futureDateString);
    cy.get('[data-testid="date-error"]').should('not.exist');
  });

  it('Debería mostrar horarios disponibles según la fecha', () => {
    // Seleccionar fecha futura
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    cy.get('[data-testid="date-input"]').type(futureDateString);
    cy.screenshot('06-future-date-selected');
    
    // Verificar que se muestren horarios disponibles
    cy.get('[data-testid="time-select"] option').should('have.length.greaterThan', 1);
    
    cy.screenshot('07-available-times-displayed');
  });

  it('Debería permitir crear turno exitosamente', () => {
    // Datos de prueba válidos
    const appointmentData = {
      specialty: 'Cardiología',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mañana
      time: '09:00'
    };
    
    // Completar formulario paso a paso
    cy.get('[data-testid="specialty-select"]').select(appointmentData.specialty);
    cy.screenshot('08-specialty-selected');
    
    cy.get('[data-testid="date-input"]').type(appointmentData.date);
    cy.screenshot('09-date-entered');
    
    cy.get('[data-testid="time-select"]').select(appointmentData.time);
    cy.screenshot('10-time-selected');
    
    // Enviar formulario
    cy.get('[data-testid="submit-button"]').click();
    
    // Verificar mensaje de éxito
    cy.get('[data-testid="success-message"]').should('be.visible');
    cy.get('[data-testid="success-message"]').should('contain', 'Turno creado exitosamente');
    
    cy.screenshot('11-appointment-created-successfully');
  });

  it('Debería mostrar confirmación del turno creado', () => {
    // Crear turno
    const appointmentData = {
      specialty: 'Dermatología',
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Pasado mañana
      time: '14:00'
    };
    
    cy.get('[data-testid="specialty-select"]').select(appointmentData.specialty);
    cy.get('[data-testid="date-input"]').type(appointmentData.date);
    cy.get('[data-testid="time-select"]').select(appointmentData.time);
    cy.get('[data-testid="submit-button"]').click();
    
    // Verificar que se muestre la confirmación
    cy.get('[data-testid="appointment-confirmation"]').should('be.visible');
    cy.get('[data-testid="appointment-confirmation"]').should('contain', appointmentData.specialty);
    cy.get('[data-testid="appointment-confirmation"]').should('contain', appointmentData.date);
    cy.get('[data-testid="appointment-confirmation"]').should('contain', appointmentData.time);
    
    cy.screenshot('12-appointment-confirmation-displayed');
  });

  it('Debería mostrar error si el horario ya está ocupado', () => {
    // Crear primer turno
    const appointmentData = {
      specialty: 'Traumatología',
      date: new Date(Date.now() + 259200000).toISOString().split('T')[0], // En 3 días
      time: '10:00'
    };
    
    cy.get('[data-testid="specialty-select"]').select(appointmentData.specialty);
    cy.get('[data-testid="date-input"]').type(appointmentData.date);
    cy.get('[data-testid="time-select"]').select(appointmentData.time);
    cy.get('[data-testid="submit-button"]').click();
    
    // Verificar éxito del primer turno
    cy.get('[data-testid="success-message"]').should('be.visible');
    
    // Intentar crear segundo turno en el mismo horario
    cy.visit('/appointment');
    cy.get('[data-testid="specialty-select"]').select(appointmentData.specialty);
    cy.get('[data-testid="date-input"]').type(appointmentData.date);
    cy.get('[data-testid="time-select"]').select(appointmentData.time);
    cy.get('[data-testid="submit-button"]').click();
    
    // Verificar mensaje de error
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Horario no disponible');
    
    cy.screenshot('13-duplicate-appointment-error');
  });

  it('Debería permitir cancelar turno', () => {
    // Crear turno primero
    const appointmentData = {
      specialty: 'Neurología',
      date: new Date(Date.now() + 345600000).toISOString().split('T')[0], // En 4 días
      time: '16:00'
    };
    
    cy.get('[data-testid="specialty-select"]').select(appointmentData.specialty);
    cy.get('[data-testid="date-input"]').type(appointmentData.date);
    cy.get('[data-testid="time-select"]').select(appointmentData.time);
    cy.get('[data-testid="submit-button"]').click();
    
    // Verificar que se creó
    cy.get('[data-testid="success-message"]').should('be.visible');
    
    // Ir a mis turnos y cancelar
    cy.visit('/my-appointments');
    cy.get('[data-testid="cancel-appointment-button"]').first().click();
    
    // Confirmar cancelación
    cy.get('[data-testid="confirm-cancel-button"]').click();
    
    // Verificar mensaje de cancelación
    cy.get('[data-testid="success-message"]').should('contain', 'Turno cancelado');
    
    cy.screenshot('14-appointment-cancelled');
  });

  it('Debería funcionar correctamente en modo oscuro', () => {
    // Cambiar a modo oscuro si existe el toggle
    cy.get('[data-testid="dark-mode-toggle"]').click().then(() => {
      // Verificar que el modo oscuro esté activo
      cy.get('body').should('have.class', 'dark');
      
      cy.screenshot('15-dark-mode-active');
      
      // Verificar que todos los elementos sean visibles
      cy.get('[data-testid="specialty-select"]').should('be.visible');
      cy.get('[data-testid="date-input"]').should('be.visible');
      cy.get('[data-testid="time-select"]').should('be.visible');
      cy.get('[data-testid="submit-button"]').should('be.visible');
    });
  });

  it('Debería mostrar calendario visual de fechas disponibles', () => {
    // Verificar que existe un calendario visual
    cy.get('[data-testid="calendar-widget"]').should('be.visible');
    
    // Verificar que las fechas futuras estén habilitadas
    cy.get('[data-testid="calendar-widget"] .future-date').should('have.length.greaterThan', 0);
    
    // Verificar que las fechas pasadas estén deshabilitadas
    cy.get('[data-testid="calendar-widget"] .past-date').should('have.class', 'disabled');
    
    cy.screenshot('16-calendar-widget-visible');
  });

  afterEach(() => {
    // Generar reporte de cobertura
    cy.generateCoverageReport();
    
    // Verificar que no hay errores en consola
    cy.checkConsoleErrors();
  });
});
