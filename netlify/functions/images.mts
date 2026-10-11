import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  const key = context.params.key;
  if (!key) {
    return new Response("Missing image key", { status: 400 });
  }

  try {
    const store = getStore("site-images");
    const blob = await store.get(key, { type: "blob" });
    if (!blob) {
      return new Response("Image not found", { status: 404 });
    }

    // Determine content type from key extension
    let contentType = "application/octet-stream";
    const lowerKey = key.toLowerCase();
    if (lowerKey.endsWith(".jpg") || lowerKey.endsWith(".jpeg")) {
      contentType = "image/jpeg";
    } else if (lowerKey.endsWith(".png")) {
      contentType = "image/png";
    } else if (lowerKey.endsWith(".webp")) {
      contentType = "image/webp";
    } else if (lowerKey.endsWith(".svg")) {
      contentType = "image/svg+xml";
    } else if (lowerKey.endsWith(".gif")) {
      contentType = "image/gif";
    }

    return new Response(blob, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error retrieving image blob:", error);
    return new Response("Error retrieving image", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/images/:key",
};
