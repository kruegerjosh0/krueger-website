// Read the file and parse it manually to test the functions inside it
const fs = require('fs');
const path = require('path');

const siteJsCode = fs.readFileSync(path.join(__dirname, '../site.js'), 'utf8');

// We can extract `isWebLink` using Function constructor or eval,
// since it is not exported.
const isWebLinkMatch = siteJsCode.match(/function isWebLink\(url\) \{[\s\S]*?\}/);

if (!isWebLinkMatch) {
    throw new Error('Could not find isWebLink function in site.js');
}

const isWebLinkStr = isWebLinkMatch[0];
const isWebLink = new Function('url', `
    ${isWebLinkStr}
    return isWebLink(url);
`);

describe('isWebLink', () => {
    test('returns true for valid http urls', () => {
        expect(isWebLink('http://example.com')).toBe(true);
    });

    test('returns true for valid https urls', () => {
        expect(isWebLink('https://example.com')).toBe(true);
    });

    test('returns false for invalid urls', () => {
        expect(isWebLink('example.com')).toBe(false);
        expect(isWebLink('ftp://example.com')).toBe(false);
        expect(isWebLink('mailto:test@example.com')).toBe(false);
        expect(isWebLink('tel:1234567890')).toBe(false);
        expect(isWebLink('/relative/path')).toBe(false);
    });

    test('returns false for non-string inputs', () => {
        expect(isWebLink(null)).toBe(false);
        expect(isWebLink(undefined)).toBe(false);
        expect(isWebLink(123)).toBe(false);
        expect(isWebLink({})).toBe(false);
    });
});
