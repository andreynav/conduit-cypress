const { defineConfig } = require("cypress")

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('@cypress/grep/src/plugin')(on,  config)
      return config
    },
    env: {
      grepOmitFiltered: true,
      grepFilterSpecs: true
    },
    specPattern: 'cypress/e2e/tests/*/*.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:3000/',
    supportFile: false
  },
});
