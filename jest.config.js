/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^lucide-react(/.*)?$": "<rootDir>/__mocks__/lucide-react-proxy.js",
  },
};

module.exports = createJestConfig(customJestConfig);
