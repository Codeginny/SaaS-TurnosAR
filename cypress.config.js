import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5181',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'docs/screenshots',
    videosFolder: 'docs/videos',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    setupNodeEvents(on, config) {
      // Configurar screenshots automáticos
      on('after:screenshot', (details) => {
        console.log(`Screenshot saved: ${details.path}`);
      });
      
      // Configurar videos automáticos
      on('after:spec', (spec, results) => {
        if (results.video) {
          console.log(`Video saved: ${results.video}`);
        }
      });
      
      // Configurar reportes de cobertura
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        },
      });
    },
    env: {
      // Variables de entorno para tests
      baseUrl: 'http://localhost:5181',
      screenshotFolder: 'docs/screenshots',
      videoFolder: 'docs/videos',
    },
    retries: {
      runMode: 2,
      openMode: 0,
    },
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
  },
});
