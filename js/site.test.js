import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import vm from "node:vm";

// Read site.js source code
const siteJs = fs.readFileSync(new URL("./site.js", import.meta.url), "utf8");

// Create a sandbox simulating a minimal browser environment
const sandbox = {
    window: { __TEST_MODE__: true },
    document: {
        querySelectorAll: () => [],
        getElementById: () => null
    },
    fetch: () => Promise.resolve({ ok: false, json: () => Promise.resolve(null) })
};

// Execute site.js in the sandbox
vm.createContext(sandbox);
vm.runInContext(siteJs, sandbox);

// Extract the exported lookup function
const lookup = sandbox.window.lookup;

test("lookup function - happy path", () => {
    const data = {
        settings: { business_name: "Krueger Painting" },
        hero: { title: "Welcome" }
    };

    assert.strictEqual(lookup(data, "settings.business_name"), "Krueger Painting");
    assert.strictEqual(lookup(data, "hero.title"), "Welcome");
});

test("lookup function - missing file data", () => {
    const data = { settings: { business_name: "Krueger Painting" } };
    assert.strictEqual(lookup(data, "hero.title"), undefined);
});

test("lookup function - missing key", () => {
    const data = { settings: { business_name: "Krueger Painting" } };
    assert.strictEqual(lookup(data, "settings.phone"), undefined);
});

test("lookup function - data is null or undefined", () => {
    // We expect it to throw a TypeError in the vm, so we check for error name rather than object identity.
    assert.throws(() => lookup(null, "settings.phone"), (err) => err.name === "TypeError");
    assert.throws(() => lookup(undefined, "settings.phone"), (err) => err.name === "TypeError");
});

test("lookup function - empty data object", () => {
    const data = {};
    assert.strictEqual(lookup(data, "settings.business_name"), undefined);
});

test("lookup function - invalid path format", () => {
    const data = { settings: { business_name: "Krueger Painting" } };
    assert.strictEqual(lookup(data, "settings"), undefined);
});
