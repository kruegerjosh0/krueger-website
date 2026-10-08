import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import * as fsPromises from "node:fs/promises";

// Mock netlify blobs
vi.mock("@netlify/blobs", () => {
  return {
    getStore: vi.fn((storeName) => ({
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(true),
      getJSON: vi.fn().mockResolvedValue({}),
      setJSON: vi.fn().mockResolvedValue(true),
    })),
  };
});

// Mock fs to simulate an image file existing locally
vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    readFile: vi.fn(async (path) => {
      if (path.includes("test-image.jpg")) {
        return Buffer.from("mock-image-data");
      }
      return actual.readFile(path);
    }),
  };
});

import { app } from "../server.js";

describe("Server Routing Tests", () => {
  it("should return the frontend app for /", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("<html");
  });

  it("should return base content from /api/content", async () => {
    const res = await request(app).get("/api/content");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("settings");
    expect(res.body).toHaveProperty("hero");
    expect(res.body).toHaveProperty("services");
    expect(res.body).toHaveProperty("estimate");
    expect(res.body).toHaveProperty("gallery");
  });

  it("should handle image uploads via /api/upload", async () => {
    const res = await request(app)
      .post("/api/upload")
      .send({ data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("url");
    expect(res.body).toHaveProperty("key");
    expect(res.body.url).toMatch(/\/api\/images\/.+/);
  });

  it("should retrieve an image via /api/images/:key", async () => {
    const res = await request(app).get("/api/images/test-image.jpg");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("image/jpeg");
    expect(res.body.toString()).toBe("mock-image-data");
  });

  it("should 404 for missing image without key", async () => {
    const res = await request(app).get("/api/images/does-not-exist.jpg");
    expect(res.status).toBe(404);
  });
});
