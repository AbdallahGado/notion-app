// Use explicit jsdom environment package name to match installed environment

/** @type {import("jest").Config} **/
module.exports = {
  ...require("ts-jest/presets").defaults,
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.jest.json" }],
  },
  // ts-jest options are provided inline in the transform tuple to avoid deprecated globals usage.
  transformIgnorePatterns: ["/node_modules/(?!(lucide-react|@radix-ui)/)"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/app/(.*)$": "<rootDir>/app/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/(.*)$": "<rootDir>/$1",
  },
};
