import { jest as jestGlobals } from '@jest/globals';

// Jest's `jest` object is not injected as a global in ESM mode.
// Expose it so specs can use jest.fn()/jest.spyOn() without per-file imports.
globalThis.jest = jestGlobals;

// Unit/e2e specs build the Nest app without main.ts; give them a test secret.
process.env.JWT_SECRET ??= 'test-only-jwt-secret-not-for-production';
