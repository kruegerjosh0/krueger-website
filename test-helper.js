import fs from 'node:fs/promises';
export const originalReadFile = fs.readFile;
export let mockReadFileFn = null;

fs.readFile = async (...args) => {
  if (mockReadFileFn) {
    return mockReadFileFn(...args);
  }
  return originalReadFile(...args);
};

export const setMockReadFile = (fn) => {
  mockReadFileFn = fn;
};

export const resetMockReadFile = () => {
  mockReadFileFn = null;
};
