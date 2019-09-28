module.exports = {
  collectCoverageFrom: [
    'controller/**/*',
    'model/**/*',
    'routes/**/*',
    'util/**/*'
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
  collectCoverage: true,
};
