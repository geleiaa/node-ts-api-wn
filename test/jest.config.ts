import { resolve } from 'path';
const root = resolve(__dirname, '..');
import rootConfig from '../jest.config';

export default {
  ...rootConfig,
  ...{
    rootDir: root,
    displayName: 'end2end-tests',
    setupFilesAfterEnv: ['<rootDir>/test/jest-setup.ts'],
    testMatch: ['<rootDir>/test/**/*.test.ts'],
  },
};

// config para testes na folder "test", os testes funcionais
