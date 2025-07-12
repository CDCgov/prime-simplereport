/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^csv-stringify/sync":
      "<rootDir>/node_modules/csv-stringify/dist/cjs/sync.cjs",
  },
};
