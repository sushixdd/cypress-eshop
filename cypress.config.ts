import { defineConfig } from "cypress";

require("dotenv").config();

module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      config.env.username = process.env.CYPRESS_USERNAME;
      config.env.password = process.env.CYPRESS_PASSWORD;
      return config;
    },
    baseUrl: "https://www.datart.cz",
    numTestsKeptInMemory: 10,
  },
};
