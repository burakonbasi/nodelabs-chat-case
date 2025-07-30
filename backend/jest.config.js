export default {
    testEnvironment: 'node',
    transform: {},
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    extensionsToTreatAsEsm: ['.js'],
    globals: {
      'ts-jest': {
        useESM: true
      }
    },
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/server.js',
      '!src/config/*.js',
      '!src/swagger/*.js'
    ],
    testMatch: [
      '**/__tests__/**/*.js',
      '**/?(*.)+(spec|test).js'
    ],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
  };