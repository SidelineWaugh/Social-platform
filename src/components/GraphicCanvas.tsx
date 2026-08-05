import type { CSSProperties } from "react";
import type {
  GraphicState,
  EventBrand,
  BackgroundData,
  ClubData,
} from "@/lib/types";
import { FORMAT_MAP } from "@/lib/formats";
import { clubInitials, findClubLogo } from "@/lib/clubs";
import { brandBackground, usesLogoWatermark } from "@/lib/brandBg";
import {
  resolveTheme,
  FONT_FAMILY,
  DISPLAY_META,
  type ChipToken,
  type Theme,
} from "@/lib/themes";

function InlineLogo({ src, size }: { src: string | null; size: number }) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
    />
  );
}

const INK = "#f3f5fb";
const MUTED = "rgba(233,237,247,0.62)";

const DISPLAY = "var(--font-display)";
const COND = "var(--font-cond)";
const SANS = "var(--font-sans)";

/** Renders a single graphic at native pixel size (1080 × format height). */
export function GraphicCanvas({
  event,
  backgrounds,
  clubs,
  clubLogo,
  state,
  today,
}: {
  event: EventBrand;
  backgrounds: BackgroundData[];
  clubs: ClubData[];
  clubLogo: string | null;
  state: GraphicState;
  today: string | null;
}) {
  const PRIMARY = event.brandColor;
  // Accent for headline highlights, chips, the kicker bar, and glows. Prefer the
  // host's accent colour so these stay legible on a dark Brand Kit background
  // (a dark primary used as text-on-dark would vanish). Falls back to the
  // primary for events with no accent set, preserving the original look.
  const RED = event.brandColor2 || event.brandColor;
  const fmt = FORMAT_MAP[state.format];
  // The event's chosen Theme drives the whole "chrome" — typography, wording
  // position, frame, kicker, footer, chip shape, glow and texture — all still
  // drawn in the brand colours.
  const theme = resolveTheme(event.theme);
  const dmeta = DISPLAY_META[theme.type.display];
  // Theme typography is applied by overriding the font CSS variables (and a few
  // headline tuning vars) on this canvas subtree, so every descendant that
  // references them re-fonts at once — no per-element threading required.
  const fontVars = {
    ["--font-display"]: FONT_FAMILY[theme.type.display],
    ["--font-cond"]: FONT_FAMILY[theme.type.label],
    ["--hl-weight"]: String(dmeta.weight),
    ["--hl-lead"]: String(dmeta.lead),
    ["--hl-space"]: dmeta.space,
  } as CSSProperties;
  // Where the hero wording sits between the fixed kicker (top) and footer.
  const heroJustify =
    theme.anchor === "top" ? "flex-start" : theme.anchor === "bottom" ? "flex-end" : "center";

  const bg = backgrounds.find((b) => b.id === state.backgroundId);
  const rawImage =
    state.backgroundId === "upload" && state.uploadedImage
      ? state.uploadedImage
      : bg?.kind === "image"
        ? bg.value
        : null;
  // External http(s) images are proxied same-origin so they display AND export.
  const imageUrl =
    rawImage && /^https?:\/\//i.test(rawImage)
      ? `/api/bg?u=${encodeURIComponent(rawImage)}`
      : rawImage;

  const eventLogoSrc = event.logoUrl
    ? /^https?:\/\//i.test(event.logoUrl)
      ? `/api/bg?u=${encodeURIComponent(event.logoUrl)}`
      : event.logoUrl
    : null;
  // A code-drawn Brand Kit background renders the event in the host club's
  // colours; a gentler, hue-neutral scrim keeps those colours vivid.
  const isBrand = bg?.kind === "brand";
  const gradient = isBrand
    ? brandBackground(bg!.value, PRIMARY, event.brandColor2)
    : bg?.kind === "gradient"
      ? bg.value
      : "linear-gradient(160deg, #16203c 0%, #0c1120 100%)";
  const scrim = isBrand
    ? "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.04) 42%, rgba(0,0,0,0.50) 82%, rgba(0,0,0,0.64) 100%)"
    : "linear-gradient(180deg, rgba(8,12,22,0.30) 0%, rgba(8,12,22,0.35) 38%, rgba(7,10,18,0.82) 82%, rgba(6,9,16,0.95) 100%)";

  // The "Crest" brand style renders the event logo as a large faded watermark —
  // the club's own mark behind the content, which always reads on-brand.
  const showWatermark = Boolean(isBrand && usesLogoWatermark(bg!.value) && eventLogoSrc);

  const initials = clubInitials(state.clubName || "FC");
  const club = state.clubName?.trim() || "Your Club";
  const pad = fmt.id === "square" ? 66 : 76;

  return (
    <div
      style={{
        position: "relative",
        width: fmt.width,
        height: fmt.height,
        overflow: "hidden",
        background: imageUrl ? "#0b1020" : gradient,
        color: INK,
        fontFamily: SANS,
        ...fontVars,
      }}
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {/* Event-logo watermark (Crest brand style): the exact logo, full-bleed,
          in its real colours, behind the scrim so text stays legible. */}
      {showWatermark && eventLogoSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={eventLogoSrc}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.25,
          }}
        />
      )}

      {/* Legibility scrim */}
      <div style={{ position: "absolute", inset: 0, background: scrim }} />
      {/* Theme brand glow (placement varies by theme) */}
      <ThemeGlow theme={theme} red={RED} />
      {/* Theme full-bleed texture (e.g. Kit pinstripes) */}
      <ThemeOverlay theme={theme} red={RED} />

      {/* Content: kicker pinned top, footer pinned bottom, hero anchored in
          the space between per the theme (top / centre / bottom). */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: pad,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top kicker (marker treatment varies by theme) */}
        <Kicker
          theme={theme}
          event={event}
          red={RED}
          showLogo={Boolean(eventLogoSrc) && state.template !== "announcement"}
          eventLogo={eventLogoSrc}
        />

        {/* Hero */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: heroJustify,
            gap: 30,
            paddingTop: 30,
            paddingBottom: 30,
          }}
        >
          {state.template !== "were-in" &&
            state.template !== "bracket" &&
            state.template !== "announcement" && (
              <ClubEyebrow initials={initials} club={club} red={RED} logo={clubLogo} />
            )}
          <TemplateBody
            state={state}
            today={today}
            event={event}
            red={RED}
            chip={theme.chip}
            logo={clubLogo}
            club={club}
            initials={initials}
            clubs={clubs}
            eventLogo={eventLogoSrc}
          />
        </div>

        {/* Footer (divider treatment varies by theme) */}
        <Footer theme={theme} event={event} red={RED} />
      </div>

      {/* Theme frame sits above content so its border reads as a crisp edge */}
      <ThemeFrame theme={theme} red={RED} />
    </div>
  );
}

/* ------------------------------ theme chrome ----------------------------- */

function ThemeGlow({ theme, red }: { theme: Theme; red: string }) {
  const orb = (s: CSSProperties) => (
    <div style={{ position: "absolute", borderRadius: "50%", ...s }} />
  );
  const bottomLeft: CSSProperties = {
    left: -160,
    bottom: -160,
    width: 620,
    height: 620,
    background: `radial-gradient(circle, ${hexToRgba(red, 0.28)} 0%, ${hexToRgba(red, 0)} 68%)`,
  };
  const topRight: CSSProperties = {
    right: -180,
    top: -180,
    width: 560,
    height: 560,
    background: `radial-gradient(circle, ${hexToRgba(red, 0.22)} 0%, ${hexToRgba(red, 0)} 68%)`,
  };
  const topCentre: CSSProperties = {
    left: "50%",
    top: -300,
    marginLeft: -380,
    width: 760,
    height: 620,
    background: `radial-gradient(circle, ${hexToRgba(red, 0.2)} 0%, ${hexToRgba(red, 0)} 66%)`,
  };
  switch (theme.glow) {
    case "none":
      return null;
    case "top":
      return orb(topCentre);
    case "split":
      return (
        <>
          {orb(bottomLeft)}
          {orb(topRight)}
        </>
      );
    case "corner":
    default:
      return orb(bottomLeft);
  }
}

function ThemeOverlay({ theme, red }: { theme: Theme; red: string }) {
  if (theme.overlay === "pinstripe") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `repeating-linear-gradient(45deg, ${hexToRgba(red, 0.07)} 0 2px, transparent 2px 24px)`,
        }}
      />
    );
  }
  if (theme.overlay === "grid") {
    // A faint pitch/board grid drawn from the accent colour.
    const line = hexToRgba(red, 0.06);
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />
    );
  }
  return null;
}

function ThemeFrame({ theme, red }: { theme: Theme; red: string }) {
  if (theme.frame === "inset") {
    return (
      <>
        <div
          style={{
            position: "absolute",
            inset: 26,
            border: `2px solid ${hexToRgba(red, 0.55)}`,
            borderRadius: 6,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 34,
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 3,
            pointerEvents: "none",
          }}
        />
      </>
    );
  }
  if (theme.frame === "brackets") {
    const len = 120;
    const th = 9;
    const off = 30;
    const bar = (s: CSSProperties, key: string) => (
      <span key={key} style={{ position: "absolute", background: red, ...s }} />
    );
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {bar({ left: off, top: off, width: len, height: th }, "tl-h")}
        {bar({ left: off, top: off, width: th, height: len }, "tl-v")}
        {bar({ right: off, top: off, width: len, height: th }, "tr-h")}
        {bar({ right: off, top: off, width: th, height: len }, "tr-v")}
        {bar({ left: off, bottom: off, width: len, height: th }, "bl-h")}
        {bar({ left: off, bottom: off, width: th, height: len }, "bl-v")}
        {bar({ right: off, bottom: off, width: len, height: th }, "br-h")}
        {bar({ right: off, bottom: off, width: th, height: len }, "br-v")}
      </div>
    );
  }
  if (theme.frame === "sidebar") {
    // A single accent stripe down the left edge — poster spine.
    return (
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 14,
          background: `linear-gradient(180deg, ${red} 0%, ${hexToRgba(red, 0.55)} 100%)`,
          pointerEvents: "none",
        }}
      />
    );
  }
  if (theme.frame === "rails") {
    // Full-width accent rails top and bottom — broadcast strap.
    const rail = (s: CSSProperties, key: string) => (
      <span
        key={key}
        style={{ position: "absolute", left: 0, right: 0, height: 12, background: red, ...s }}
      />
    );
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {rail({ top: 0 }, "top")}
        {rail({ bottom: 0 }, "bottom")}
      </div>
    );
  }
  return null;
}

function Kicker({
  theme,
  event,
  red,
  showLogo,
  eventLogo,
}: {
  theme: Theme;
  event: EventBrand;
  red: string;
  showLogo: boolean;
  eventLogo: string | null;
}) {
  const name: CSSProperties = {
    fontFamily: COND,
    fontWeight: 700,
    fontSize: 25,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  };
  let left: React.ReactNode;
  switch (theme.kicker) {
    case "block":
      left = (
        <span
          style={{
            ...name,
            color: "#0b1020",
            background: red,
            borderRadius: 4,
            padding: "9px 18px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
          }}
        >
          {event.name}
        </span>
      );
      break;
    case "chevron":
      left = (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              width: 24,
              height: 26,
              background: red,
              clipPath: "polygon(0 0, 100% 50%, 0 100%)",
            }}
          />
          <span style={name}>{event.name}</span>
        </div>
      );
      break;
    case "rule":
      left = (
        <span
          style={{ ...name, paddingBottom: 9, borderBottom: `2px solid ${hexToRgba(red, 0.75)}` }}
        >
          {event.name}
        </span>
      );
      break;
    case "tall":
      left = (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ width: 12, height: 42, background: red, borderRadius: 2 }} />
          <span style={{ ...name, fontSize: 28 }}>{event.name}</span>
        </div>
      );
      break;
    case "bar":
    default:
      left = (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 30, height: 6, background: red, borderRadius: 2 }} />
          <span style={name}>{event.name}</span>
        </div>
      );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {left}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span
          style={{
            fontFamily: COND,
            fontWeight: 600,
            fontSize: 23,
            letterSpacing: "0.22em",
            color: MUTED,
          }}
        >
          {event.season}
        </span>
        {showLogo && eventLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={eventLogo}
            alt=""
            style={{ height: 220, width: "auto", maxWidth: 480, objectFit: "contain" }}
          />
        )}
      </div>
    </div>
  );
}

function Footer({
  theme,
  event,
  red,
}: {
  theme: Theme;
  event: EventBrand;
  red: string;
}) {
  const isTicker = theme.footer === "ticker";
  const borderTop = isTicker
    ? "none"
    : theme.footer === "solid"
      ? `3px solid ${red}`
      : theme.footer === "double"
        ? `4px double ${hexToRgba(red, 0.75)}`
        : "2px solid rgba(255,255,255,0.14)";
  return (
    <>
      {isTicker && (
        // A dashed accent measure above the footer — broadcast ticker.
        <div
          style={{
            height: 8,
            marginBottom: 18,
            background: `repeating-linear-gradient(90deg, ${red} 0 18px, transparent 18px 30px)`,
          }}
        />
      )}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop,
        paddingTop: isTicker ? 0 : 22,
      }}
    >
      <span
        style={{
          fontFamily: DISPLAY,
          fontSize: 30,
          letterSpacing: "0.02em",
          color: red,
          fontStyle: "italic",
        }}
      >
        {event.hashtag}
      </span>
      <span
        style={{
          fontFamily: COND,
          fontWeight: 600,
          fontSize: 20,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: MUTED,
        }}
      >
        Powered by {event.organizer}
      </span>
    </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

function ClubEyebrow({
  initials,
  club,
  red,
  logo,
}: {
  initials: string;
  club: string;
  red: string;
  logo: string | null;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt=""
          style={{
            width: 108,
            height: 108,
            objectFit: "contain",
            flexShrink: 0,
            filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.55))",
          }}
        />
      ) : (
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: "50%",
            border: `3px solid ${red}`,
            background: "rgba(9,13,24,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: DISPLAY, fontSize: 38, letterSpacing: "0.02em" }}>
            {initials}
          </span>
        </div>
      )}
      <span
        style={{
          fontFamily: COND,
          fontWeight: 700,
          fontSize: 40,
          lineHeight: 1.02,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          maxWidth: 620,
        }}
      >
        {club}
      </span>
    </div>
  );
}

const headline: CSSProperties = {
  fontFamily: DISPLAY,
  // Weight / leading / tracking come from the theme's display face (set as CSS
  // vars on the canvas root); fallbacks reproduce the original Anton tuning.
  fontWeight: "var(--hl-weight, 400)" as unknown as number,
  lineHeight: "var(--hl-lead, 0.86)" as unknown as number,
  letterSpacing: "var(--hl-space, 0.005em)",
  textTransform: "uppercase",
  margin: 0,
};

const subline: CSSProperties = {
  fontFamily: COND,
  fontWeight: 600,
  fontSize: 30,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: MUTED,
};

/** Theme-specific shape overrides layered on top of the base chip style. */
function chipShape(chip: ChipToken, red: string): CSSProperties {
  switch (chip) {
    case "square":
      return { borderRadius: 6 };
    case "cut":
      return {
        borderRadius: 0,
        clipPath:
          "polygon(11px 0, 100% 0, 100% calc(100% - 11px), calc(100% - 11px) 100%, 0 100%, 0 11px)",
      };
    case "line":
      return {
        borderRadius: 0,
        background: "transparent",
        border: "none",
        borderBottom: `3px solid ${hexToRgba(red, 0.8)}`,
        padding: "6px 4px",
      };
    case "pill":
    default:
      return { borderRadius: 999 };
  }
}

function Chip({
  children,
  red,
  chip = "pill",
}: {
  children: React.ReactNode;
  red: string;
  chip?: ChipToken;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: COND,
        fontWeight: 700,
        fontSize: 26,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: INK,
        background: hexToRgba(red, 0.16),
        border: `1.5px solid ${hexToRgba(red, 0.55)}`,
        padding: "10px 22px",
        ...chipShape(chip, red),
      }}
    >
      {children}
    </span>
  );
}

function TemplateBody({
  state,
  today,
  event,
  red,
  chip,
  logo,
  club,
  initials,
  clubs,
  eventLogo,
}: {
  state: GraphicState;
  today: string | null;
  event: EventBrand;
  red: string;
  chip: ChipToken;
  logo: string | null;
  club: string;
  initials: string;
  clubs: ClubData[];
  eventLogo: string | null;
}) {
  switch (state.template) {
    case "were-in":
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 22,
          }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt=""
              style={{
                width: state.format === "square" ? 380 : 470,
                height: state.format === "square" ? 380 : 470,
                objectFit: "contain",
                filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.6))",
                marginBottom: 8,
              }}
            />
          ) : (
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: "50%",
                border: `4px solid ${red}`,
                background: "rgba(9,13,24,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontFamily: DISPLAY, fontSize: 60 }}>{initials}</span>
            </div>
          )}
          <div
            style={{
              fontFamily: COND,
              fontWeight: 700,
              fontSize: 44,
              lineHeight: 1.02,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              maxWidth: 780,
            }}
          >
            {club}
          </div>
          <h1 style={{ ...headline, fontSize: 168, color: red }}>Confirmed</h1>
          <div style={subline}>Officially headed to the {event.shortName}</div>
          {state.ageGroup && (
            <div>
              <Chip red={red} chip={chip}>{state.ageGroup}</Chip>
            </div>
          )}
        </div>
      );

    case "champions":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ ...subline, color: red, fontWeight: 700 }}>🏆 Champions</div>
          <h1 style={{ ...headline, fontSize: 150 }}>
            {state.championTitle || "Division Champions"}
          </h1>
          {state.ageGroup && <div style={subline}>{state.ageGroup}</div>}
        </div>
      );

    case "matchday":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <h1 style={{ ...headline, fontSize: 128 }}>Matchday</h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontFamily: DISPLAY,
              fontSize: 60,
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: MUTED, fontSize: 34 }}>VS</span>
            <InlineLogo src={findClubLogo(clubs, state.opponent)} size={76} />
            <span>{state.opponent || "Opponent"}</span>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {state.kickoff && <Chip red={red} chip={chip}>{state.kickoff}</Chip>}
            {state.field && <Chip red={red} chip={chip}>{state.field}</Chip>}
            {state.ageGroup && <Chip red={red} chip={chip}>{state.ageGroup}</Chip>}
          </div>
        </div>
      );

    case "bracket": {
      const teams = state.bracketTeams.map((t) => t.trim()).filter(Boolean);
      const twoCol = teams.length > 5;
      const shown = teams.slice(0, 12);
      const overflow = teams.length - shown.length;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ ...subline, color: red, fontWeight: 700 }}>Bracket</div>
          <h1 style={{ ...headline, fontSize: 96 }}>
            {state.bracketName || "The Field"}
          </h1>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: twoCol ? "1fr 1fr" : "1fr",
              gap: 12,
            }}
          >
            {shown.map((t, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "rgba(12,17,30,0.55)",
                  borderLeft: `5px solid ${red}`,
                  borderRadius: 10,
                  padding: twoCol ? "12px 18px" : "16px 22px",
                }}
              >
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: twoCol ? 30 : 38,
                    color: red,
                    minWidth: 30,
                  }}
                >
                  {i + 1}
                </span>
                <InlineLogo src={findClubLogo(clubs, t)} size={twoCol ? 44 : 56} />
                <span
                  style={{
                    fontFamily: COND,
                    fontWeight: 700,
                    fontSize: twoCol ? 28 : 36,
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                    lineHeight: 1.02,
                  }}
                >
                  {t}
                </span>
              </div>
            ))}
          </div>
          {overflow > 0 && <div style={{ ...subline, fontSize: 26 }}>+{overflow} more</div>}
        </div>
      );
    }

    case "schedule":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <h1 style={{ ...headline, fontSize: 104 }}>Group Stage</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {state.games.map((g, i) => (
              <ScheduleRow
                key={i}
                index={i + 1}
                opponent={g.opponent}
                detail={g.detail}
                red={red}
                logo={findClubLogo(clubs, g.opponent)}
              />
            ))}
          </div>
        </div>
      );

    case "result": {
      const our = state.ourScore.trim();
      const their = state.theirScore.trim();
      const outcome = resultOutcome(our, their);
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ ...subline, color: red, fontWeight: 700 }}>Full Time</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 30 }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 170, lineHeight: 0.85 }}>
              {our || "0"}
            </span>
            <span style={{ fontFamily: DISPLAY, fontSize: 96, color: MUTED }}>–</span>
            <span style={{ fontFamily: DISPLAY, fontSize: 170, lineHeight: 0.85 }}>
              {their || "0"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontFamily: DISPLAY,
              fontSize: 52,
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            <span style={{ color: MUTED, fontSize: 30 }}>VS</span>
            <InlineLogo src={findClubLogo(clubs, state.opponent)} size={64} />
            <span>{state.opponent || "Opponent"}</span>
          </div>
          {outcome && (
            <div>
              <span
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 30,
                  letterSpacing: "0.08em",
                  color: "#0b1020",
                  background: outcome.color,
                  borderRadius: 8,
                  padding: "8px 20px",
                }}
              >
                {outcome.label}
              </span>
            </div>
          )}
        </div>
      );
    }

    case "countdown": {
      const days = daysUntil(state.targetDate, today);
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 42 }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 244, lineHeight: 0.78, color: red }}>
              {days ?? "—"}
            </span>
            <span style={{ ...headline, fontSize: 88, marginBottom: 16 }}>
              {days === 1 ? "Day" : "Days"}
              <br />
              To Go
            </span>
          </div>
          <div style={subline}>
            {state.countdownLabel || "Kickoff"} · {formatDate(state.targetDate)}
          </div>
        </div>
      );
    }

    case "announcement":
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 22,
          }}
        >
          {eventLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={eventLogo}
              alt=""
              style={{
                maxWidth: 580,
                maxHeight: state.format === "square" ? 250 : 330,
                objectFit: "contain",
                marginBottom: 6,
                filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.55))",
              }}
            />
          )}
          <div style={{ ...subline, color: red, fontWeight: 700, fontSize: 34 }}>
            {state.announceHeadline || "Save The Date"}
          </div>
          <h1 style={{ ...headline, fontSize: state.format === "square" ? 92 : 108 }}>
            {event.name}
          </h1>
          {state.announceSubtext && <div style={subline}>{state.announceSubtext}</div>}
          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {event.startDateIso && <Chip red={red} chip={chip}>{formatDate(event.startDateIso)}</Chip>}
            {event.venue && <Chip red={red} chip={chip}>{event.venue}</Chip>}
          </div>
        </div>
      );

    default:
      return null;
  }
}

function ScheduleRow({
  index,
  opponent,
  detail,
  red,
  logo,
}: {
  index: number;
  opponent: string;
  detail: string;
  red: string;
  logo: string | null;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        background: "rgba(12,17,30,0.55)",
        borderLeft: `5px solid ${red}`,
        borderRadius: 10,
        padding: "18px 24px",
      }}
    >
      <span style={{ fontFamily: DISPLAY, fontSize: 40, color: red, minWidth: 34 }}>
        {index}
      </span>
      <InlineLogo src={logo} size={56} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        <span
          style={{
            fontFamily: COND,
            fontWeight: 700,
            fontSize: 38,
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            lineHeight: 1,
          }}
        >
          {opponent || "TBD"}
        </span>
        {detail && (
          <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, color: MUTED }}>
            {detail}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function resultOutcome(our: string, their: string) {
  const a = Number(our);
  const b = Number(their);
  if (our === "" || their === "" || Number.isNaN(a) || Number.isNaN(b)) return null;
  if (a > b) return { label: "Win", color: "#37d67a" };
  if (a < b) return { label: "Loss", color: "#e83a48" };
  return { label: "Draw", color: "#e9c23a" };
}

function daysUntil(target: string, today: string | null): number | null {
  if (!target || !today) return null;
  const t = Date.parse(target + "T00:00:00");
  const n = Date.parse(today + "T00:00:00");
  if (Number.isNaN(t) || Number.isNaN(n)) return null;
  return Math.max(0, Math.round((t - n) / 86_400_000));
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();
}

/** Accepts #rgb / #rrggbb and returns an rgba() string. */
function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return `rgba(232,58,72,${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
