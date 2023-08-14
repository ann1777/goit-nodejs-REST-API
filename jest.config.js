export default {
  preset: 'ts-jest/presets/default',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Adjust the path based on your project structure
  },
  transform: {
    transform_regex: 'ts-jest',
    // '^.+\\.tsx?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
