import Anthropic from "@anthropic-ai/sdk";

export interface BrandColors {
  primary: string; // dark/dominant — used as the Brand Kit background base
  accent: string; // bright highlight — used for headlines/accents
}

const HEX = /^#[0-9a-f]{6}$/i;

/** Split a data URL into an Anthropic image source (base64 + media type). */
function parseDataUrl(dataUrl: string): { media_type: string; data: string } | null {
  const m = dataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (!m) return null;
  const media_type = m[1].toLowerCase();
  if (!/^image\/(png|jpeg|gif|webp)$/.test(media_type)) return null;
  return { media_type, data: m[2] };
}

const PROMPT = `You are a brand designer analysing a sports club logo/crest.
Return the club's two key brand colours as hex codes:
- "primary": the dominant, solid brand colour — the one you'd use as a background base (usually the darkest, most saturated colour in the crest, e.g. a navy, forest green, or maroon). Avoid pure white/black/grey unless the brand is genuinely monochrome.
- "accent": a brighter secondary colour that pops against the primary, for headlines and highlights. If the crest has only one strong colour, return a lighter, more saturated version of it.
Respond with ONLY minified JSON and nothing else: {"primary":"#RRGGBB","accent":"#RRGGBB"}`;

/**
 * Read a club's brand colours from its logo using Claude vision. Requires
 * ANTHROPIC_API_KEY. Throws on a missing key, an unusable image, or an
 * unparseable response so callers can surface a clear message.
 */
export async function extractBrandColors(logoDataUrl: string): Promise<BrandColors> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("no-key");
  const img = parseDataUrl(logoDataUrl);
  if (!img) throw new Error("bad-image");

  const client = new Anthropic();
  const res = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: img.media_type as "image/png", data: img.data },
          },
          { type: "text", text: PROMPT },
        ],
      },
    ],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  const match = text.match(/\{[^}]*\}/);
  if (!match) throw new Error("no-json");
  const parsed = JSON.parse(match[0]) as { primary?: string; accent?: string };
  const primary = (parsed.primary ?? "").trim().toLowerCase();
  const accent = (parsed.accent ?? "").trim().toLowerCase();
  if (!HEX.test(primary) || !HEX.test(accent)) throw new Error("bad-hex");
  return { primary, accent };
}
