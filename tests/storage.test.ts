import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, loadPreferences, savePreferences } from '../src/lib/storage';

test('preferences recover from malformed or unavailable storage and always start muted', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  let raw: string | null = null;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: () => raw,
    setItem: (_key: string, value: string) => { raw = value; },
  } });
  try {
    for (const value of ['null', '[]', '"invalid"', '{', '{"best":1e99}', '{"best":-1}']) {
      raw = value; assert.deepEqual(loadPreferences(), defaults);
    }
    savePreferences({ ...defaults, best: 125, muted: false });
    assert.equal(loadPreferences().best, 125);
    assert.equal(loadPreferences().muted, true);
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage blocked'); } });
    assert.deepEqual(loadPreferences(), defaults);
    assert.doesNotThrow(() => savePreferences(defaults));
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
