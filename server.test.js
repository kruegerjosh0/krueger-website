import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert';
import { setMockReadFile, resetMockReadFile } from './test-helper.js';

const { getBaseContent, getStore } = await import('./server.js');

describe('getBaseContent', () => {
  afterEach(() => {
    resetMockReadFile();
    const store = getStore("site-data");
    store.set('content', undefined);
  });

  test('returns fallback content when blob store is empty', async () => {
    setMockReadFile(async (filePath) => {
      if (filePath.endsWith('settings.json')) return '{"business_name": "Fallback Settings"}';
      if (filePath.endsWith('hero.json')) return '{"headline_white": "Fallback Hero"}';
      if (filePath.endsWith('services.json')) return '[{"title": "Fallback Service"}]';
      if (filePath.endsWith('estimate.json')) return '{"text": "Fallback Estimate"}';
      if (filePath.endsWith('gallery.json')) return '{"categories": []}';
      throw new Error('File not found: ' + filePath);
    });

    const blobStore = getStore("site-data");
    await blobStore.setJSON('content', null);

    const content = await getBaseContent();

    assert.deepEqual(content.settings, { business_name: 'Fallback Settings' });
    assert.deepEqual(content.hero, { headline_white: 'Fallback Hero' });
    assert.deepEqual(content.services, [{ title: 'Fallback Service' }]);
    assert.deepEqual(content.estimate, { text: 'Fallback Estimate' });
    assert.deepEqual(content.gallery, { categories: [] });
  });

  test('merges blob content over fallback content correctly', async () => {
    setMockReadFile(async (filePath) => {
      if (filePath.endsWith('settings.json')) return '{"business_name": "Fallback Settings", "phone": "123"}';
      if (filePath.endsWith('hero.json')) return '{"headline_white": "Fallback Hero", "overlay_opacity": 0.5}';
      if (filePath.endsWith('services.json')) return '[{"title": "Fallback Service"}]';
      if (filePath.endsWith('estimate.json')) return '{"text": "Fallback Estimate"}';
      if (filePath.endsWith('gallery.json')) return '{"categories": []}';
      throw new Error('File not found: ' + filePath);
    });

    const blobStore = getStore("site-data");
    await blobStore.setJSON('content', {
      settings: { business_name: 'Blob Settings' },
      hero: { headline_white: 'Blob Hero' },
      services: [{ title: 'Blob Service' }],
      gallery: { extra: true }
    });

    const content = await getBaseContent();

    assert.deepEqual(content.settings, { business_name: 'Blob Settings', phone: '123' });
    assert.deepEqual(content.hero, { headline_white: 'Blob Hero', overlay_opacity: 0.5 });
    assert.deepEqual(content.services, [{ title: 'Blob Service' }]);
    assert.deepEqual(content.estimate, { text: 'Fallback Estimate' });
    assert.deepEqual(content.gallery, { categories: [], extra: true });
  });

  test('handles missing fallback files gracefully', async () => {
    setMockReadFile(async () => {
      throw new Error('ENOENT');
    });

    const blobStore = getStore("site-data");
    await blobStore.setJSON('content', null);

    const content = await getBaseContent();

    assert.deepEqual(content.settings, {});
    assert.deepEqual(content.hero, {});
    assert.deepEqual(content.services, {});
    assert.deepEqual(content.estimate, {});
    assert.deepEqual(content.gallery, {});
  });
});
