const js = require('@eslint/js');
const pluginCypress = require('eslint-plugin-cypress');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/', 'cypress/screenshots/', 'cypress/videos/'] },
  js.configs.recommended,
  {
    files: ['*.config.js'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
  },
  {
    files: ['cypress/**/*.js'],
    ...pluginCypress.configs.recommended,
    languageOptions: {
      ...pluginCypress.configs.recommended.languageOptions,
      sourceType: 'module',
      globals: { ...globals.mocha, ...pluginCypress.configs.globals.languageOptions.globals },
    },
  },
];
