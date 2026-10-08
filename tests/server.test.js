import { test, mock } from 'node:test';
import assert from 'node:assert';
import fsPromises from 'node:fs/promises';
import { loadFallbackJSON } from '../server.js';

test('loadFallbackJSON error path', async (t) => {
  await t.test('returns null when fs.readFile throws an error', async () => {
    // Mock fs.readFile to throw a specific error
    const mockReadFile = mock.method(fsPromises, 'readFile', async () => {
      throw new Error('Specific mock error');
    });

    // Call the function
    const result = await loadFallbackJSON('nonexistent');

    // Assert it returns null
    assert.strictEqual(result, null);

    // Assert the mock was actually called to ensure we aren't just hitting the real filesystem
    assert.strictEqual(mockReadFile.mock.calls.length, 1);

    // Restore the mock
    mock.restoreAll();
  });
});
