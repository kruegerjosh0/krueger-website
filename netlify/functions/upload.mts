import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

try {
  if (getApps().length === 0) {
    initializeApp({
        projectId: "krueger-painting-demo" // Use a fallback string to prevent missing credentials errors locally when not specified. We can extract it from the env later if needed.
    });
  }
} catch (e) {}

async function authenticate(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    // If not in a real Firebase setup with credentials, verification will fail.
    // In many standalone setups, initializing without credentials checks GOOGLE_APPLICATION_CREDENTIALS.
    await getAuth().verifyIdToken(idToken);
    return true;
  } catch {
    return false;
  }
}
import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, _context: Context) => {
  if (!(await authenticate(req))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let fileBuffer: ArrayBuffer;
    let extension = "jpg";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      if (!file || !(file instanceof Blob)) {
        return Response.json({ error: "No file uploaded" }, { status: 400 });
      }

      const originalName = "name" in file ? (file as File).name : "upload.jpg";
      const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
      if (extMatch) {
        extension = extMatch[1].toLowerCase();
      }
      fileBuffer = await file.arrayBuffer();
    } else {
      const body = await req.json();
      if (!body.data) {
        return Response.json({ error: "Missing data payload" }, { status: 400 });
      }

      const match = body.data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (match) {
        extension = match[1] === "jpeg" ? "jpg" : match[1];
        const binaryString = atob(match[2]);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        fileBuffer = bytes.buffer;
      } else {
        return Response.json({ error: "Invalid image format" }, { status: 400 });
      }
    }

    const safeKey = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const store = getStore("site-images");
    await store.set(safeKey, fileBuffer);

    return Response.json({
      url: `/api/images/${safeKey}`,
      key: safeKey,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/upload",
};
