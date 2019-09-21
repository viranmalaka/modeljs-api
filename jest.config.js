module.exports = {
  collectCoverageFrom: [
    '!__test__/**/*',
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
  moduleDirectories: ['node_modules'],
  testPathIgnorePatterns: ['/node_modules/'],
  testEnvironment: 'node',
};
