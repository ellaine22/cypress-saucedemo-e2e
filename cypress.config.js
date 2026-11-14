const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');
const { plugin: cypressGrepPlugin } = require('@cypress/grep/plugin');

function loadEnvConfig(name) {
  const file = path.resolve(__dirname, 'cypress', 'config', `${name}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`No config found for environment "${name}" (looked in ${file})`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

module.exports = defineConfig({
  // Secrets are only readable through cy.env(), never the synchronous Cypress.env()
  allowCypressEnv: false,

  viewportWidth: 1280,
  viewportHeight: 800,
  defaultCommandTimeout: 8000,
  video: false,
  screenshotOnRunFailure: true,
  retries: {
    runMode: 1,
    openMode: 0,
  },

  e2e: {
    baseUrl: 'https://www.saucedemo.com',
    specPattern: 'cypress/e2e/**/*.cy.js',
    setupNodeEvents(on, config) {
      const target = config.expose.target || 'prod';
      const envConfig = loadEnvConfig(target);

      config.baseUrl = envConfig.baseUrl || config.baseUrl;
      // CLI values win over the file, so `--expose apiUrl=...` still works
      config.expose = { ...envConfig.expose, ...config.expose };
      config.env = { ...envConfig.env, ...config.env };

      // grep reads its options from config.expose, so it has to run after the merge
      return cypressGrepPlugin(config);
    },
  },
});
