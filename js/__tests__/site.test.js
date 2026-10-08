import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const siteJsCode = fs.readFileSync(path.join(__dirname, '..', 'site.js'), 'utf8');

const sandbox = {
    window: {
        netlifyIdentity: undefined,
        process: { env: { NODE_ENV: 'test' } },
        __TEST_EXPORTS__: {}
    },
    document: {
        querySelectorAll: () => [],
        getElementById: () => null
    },
    fetch: jest.fn(),
    console: console,
    Promise: Promise
};

vm.createContext(sandbox);
vm.runInContext(siteJsCode, sandbox);

const loadJSON = sandbox.window.__TEST_EXPORTS__.loadJSON;

describe('loadJSON', () => {
    beforeEach(() => {
        sandbox.fetch.mockClear();
    });

    it('should return parsed JSON when response is ok', async () => {
        const mockData = { key: 'value' };
        sandbox.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockData),
        });

        const result = await loadJSON('settings');

        expect(sandbox.fetch).toHaveBeenCalledWith('/data/settings.json', { cache: 'no-cache' });
        expect(result).toEqual(mockData);
    });

    it('should return null when response is not ok', async () => {
        sandbox.fetch.mockResolvedValue({
            ok: false,
        });

        const result = await loadJSON('settings');

        expect(sandbox.fetch).toHaveBeenCalledWith('/data/settings.json', { cache: 'no-cache' });
        expect(result).toBeNull();
    });

    it('should return null when fetch throws an error', async () => {
        sandbox.fetch.mockRejectedValue(new Error('Network error'));

        const result = await loadJSON('settings');

        expect(sandbox.fetch).toHaveBeenCalledWith('/data/settings.json', { cache: 'no-cache' });
        expect(result).toBeNull();
    });
});
