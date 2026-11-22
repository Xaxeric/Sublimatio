import { jest as jestGlobals } from '@jest/globals';

// Jest's `jest` object is not injected as a global in ESM mode.
// Expose it so specs can use jest.fn()/jest.spyOn() without per-file imports.
globalThis.jest = jestGlobals;
