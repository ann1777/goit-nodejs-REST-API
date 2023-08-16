export default {
  preset: 'ts-jest/presets/default',
  setupFilesAfterEnv: ['./node_modules/@shelf/jest-mongodb/lib/setup.js'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    transform_regex: 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
