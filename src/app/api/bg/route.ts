import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Proxy an external background image through our own origin. External image
 * URLs often lack CORS headers, so loading them directly with crossOrigin
 * (required for the PNG export) fails and the graphic renders blank. Serving
 * them same-origin fixes both display and export.
 */
export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u");
  if (!u) return new Response("missing url", { status: 400 });

  let url: URL;
  try {
    url = new URL(u);
  } catch {
    return new Response("bad url", { status: 400 });
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return new Response("bad protocol", { status: 400 });
  }

  // Basic SSRF guard in production: refuse private / loopback hosts.
  if (process.env.NODE_ENV === "production") {
    const h = url.hostname;
    const isPrivate =
      h === "localhost" ||
      /^(127\.|0\.0\.0\.0|10\.|169\.254\.|192\.168\.)/.test(h) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
      h.endsWith(".internal") ||
      h.endsWith(".local");
    if (isPrivate) return new Response("forbidden host", { status: 403 });
  }

  try {
    const upstream = await fetch(url.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 SidelineSocialStudio" },
      redirect: "follow",
    });
    if (!upstream.ok) return new Response("upstream error", { status: 502 });
    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return new Response("not an image", { status: 415 });
    }
    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return new Response("fetch failed", { status: 502 });
  }
}
