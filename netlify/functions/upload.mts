import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, _context: Context) => {
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
