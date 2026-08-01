"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import type {
  GraphicState,
  EventBrand,
  ClubData,
  BackgroundData,
} from "@/lib/types";
import { TEMPLATES } from "@/lib/templates";
import { FORMATS } from "@/lib/formats";
import { clubInitials } from "@/lib/clubs";

type Update = (patch: Partial<GraphicState>) => void;

interface SectionProps {
  state: GraphicState;
  update: Update;
  event: EventBrand;
  clubs: ClubData[];
  backgrounds: BackgroundData[];
}

export function Controls(props: SectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <TemplateSection {...props} />
      <ClubSection {...props} />
      <BackgroundSection {...props} />
      <DetailsSection {...props} />
      <FormatSection {...props} />
    </div>
  );
}

/* --------------------------------- shell -------------------------------- */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-panel p-5">
      <h2 className="label mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label mb-1.5 block text-ink-faint!">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-line bg-input px-3.5 py-2.5 text-[15px] text-ink " +
  "placeholder:text-ink-faint outline-none transition focus:border-brand/70 " +
  "focus:ring-2 focus:ring-brand/25";

/* ------------------------------- template ------------------------------- */

function TemplateSection({ state, update, event }: SectionProps) {
  const enabled = TEMPLATES.filter((t) => event.enabledTemplates.includes(t.id));
  return (
    <Section title="Template">
      <div className="grid grid-cols-3 gap-2.5">
        {enabled.map((t) => {
          const active = state.template === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => update({ template: t.id })}
              className={
                "flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center transition " +
                (active
                  ? "border-brand bg-brand text-white shadow-[0_6px_20px_-8px_rgba(232,58,72,0.8)]"
                  : "border-line bg-input text-ink hover:border-line-strong hover:bg-panel-2")
              }
            >
              <span className="text-xl leading-none">{t.emoji}</span>
              <span className="font-cond text-[13px] font-bold uppercase tracking-[0.12em]">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

/* --------------------------------- club --------------------------------- */

function ClubSection({ state, update, clubs }: SectionProps) {
  const known = clubs.some((c) => c.name === state.clubName);
  const [manual, setManual] = useState(!known && state.clubName !== "");
  const selected = clubs.find((c) => c.name === state.clubName);

  return (
    <Section title="Your Club">
      {manual ? (
        <Field label="Club name">
          <input
            className={inputClass}
            placeholder="Enter your club name"
            value={state.clubName}
            autoFocus
            onChange={(e) => update({ clubName: e.target.value })}
          />
        </Field>
      ) : (
        <Field label="Select your club">
          <select
            className={inputClass}
            value={known ? state.clubName : ""}
            onChange={(e) => update({ clubName: e.target.value })}
          >
            <option value="">— Choose your club —</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      {!manual && selected && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-line bg-input/60 p-2.5">
          {selected.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected.logoUrl}
              alt=""
              className="h-9 w-9 shrink-0 object-contain"
            />
          ) : (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brand/60 font-cond text-[12px] font-bold text-ink">
              {clubInitials(selected.name)}
            </span>
          )}
          <span className="font-cond text-sm font-bold uppercase tracking-wide text-ink">
            {selected.name}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setManual((m) => !m)}
        className="mt-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted transition hover:text-ink"
      >
        {manual ? "‹ Pick from list" : "Not listed? Enter manually ›"}
      </button>
    </Section>
  );
}

/* ------------------------------ background ------------------------------- */

function BackgroundSection({ state, update, backgrounds }: SectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      update({ backgroundId: "upload", uploadedImage: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <Section title="Background">
      <div className="grid grid-cols-5 gap-2">
        {backgrounds.map((b) => {
          const active = state.backgroundId === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => update({ backgroundId: b.id })}
              className={
                "group relative aspect-square overflow-hidden rounded-lg border-2 transition " +
                (active ? "border-brand" : "border-line hover:border-line-strong")
              }
              style={
                b.kind === "gradient"
                  ? { background: b.value }
                  : {
                      backgroundImage: `url(${b.value})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
              }
              title={b.label}
            >
              <span className="absolute inset-x-0 bottom-0 bg-black/45 py-0.5 text-center text-[9px] font-bold uppercase tracking-wider text-white">
                {b.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={
            "flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-3 text-[13px] font-semibold transition " +
            (state.backgroundId === "upload"
              ? "border-brand/70 text-ink"
              : "border-line text-ink-muted hover:border-line-strong hover:text-ink")
          }
        >
          {state.backgroundId === "upload"
            ? "✓ Custom photo uploaded"
            : "⬆ Upload your own photo"}
        </button>
      </div>
    </Section>
  );
}

/* -------------------------------- details ------------------------------- */

function DetailsSection({ state, update, clubs }: SectionProps) {
  const listId = useId();
  const clubDatalist = (
    <datalist id={listId}>
      {clubs.map((c) => (
        <option key={c.id} value={c.name} />
      ))}
    </datalist>
  );

  const opponentInput = (
    value: string,
    onChange: (v: string) => void,
    placeholder = "Opponent",
  ) => (
    <>
      <input
        className={inputClass}
        list={listId}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {clubDatalist}
    </>
  );

  return (
    <Section title="Details">
      <div className="flex flex-col gap-4">
        {(state.template === "were-in" ||
          state.template === "champions" ||
          state.template === "matchday" ||
          state.template === "schedule") && (
          <Field label="Age group / Division">
            <input
              className={inputClass}
              placeholder="U14 Boys Elite"
              value={state.ageGroup}
              onChange={(e) => update({ ageGroup: e.target.value })}
            />
          </Field>
        )}

        {state.template === "champions" && (
          <Field label="Title">
            <input
              className={inputClass}
              placeholder="Division Champions"
              value={state.championTitle}
              onChange={(e) => update({ championTitle: e.target.value })}
            />
          </Field>
        )}

        {state.template === "matchday" && (
          <>
            <Field label="Opponent">
              {opponentInput(state.opponent, (v) => update({ opponent: v }))}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Kickoff">
                <input
                  className={inputClass}
                  placeholder="Fri · 10:00 AM"
                  value={state.kickoff}
                  onChange={(e) => update({ kickoff: e.target.value })}
                />
              </Field>
              <Field label="Field">
                <input
                  className={inputClass}
                  placeholder="Field 3"
                  value={state.field}
                  onChange={(e) => update({ field: e.target.value })}
                />
              </Field>
            </div>
          </>
        )}

        {state.template === "schedule" &&
          state.games.map((g, i) => (
            <div key={i} className="rounded-lg border border-line bg-input/40 p-3">
              <div className="label mb-2 text-brand!">Game {i + 1}</div>
              <div className="flex flex-col gap-3">
                <Field label="Opponent">
                  {opponentInput(
                    g.opponent,
                    (v) => {
                      const games = state.games.map((x, xi) =>
                        xi === i ? { ...x, opponent: v } : x,
                      );
                      update({ games });
                    },
                    "— Select opponent —",
                  )}
                </Field>
                <Field label="Time & field">
                  <input
                    className={inputClass}
                    placeholder="Fri 10:00 AM · Field 3"
                    value={g.detail}
                    onChange={(e) => {
                      const games = state.games.map((x, xi) =>
                        xi === i ? { ...x, detail: e.target.value } : x,
                      );
                      update({ games });
                    }}
                  />
                </Field>
              </div>
            </div>
          ))}

        {state.template === "result" && (
          <>
            <Field label="Opponent">
              {opponentInput(state.opponent, (v) => update({ opponent: v }))}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Your score">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  placeholder="3"
                  value={state.ourScore}
                  onChange={(e) => update({ ourScore: e.target.value })}
                />
              </Field>
              <Field label="Opponent score">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  placeholder="1"
                  value={state.theirScore}
                  onChange={(e) => update({ theirScore: e.target.value })}
                />
              </Field>
            </div>
          </>
        )}

        {state.template === "countdown" && (
          <>
            <Field label="Event date">
              <input
                type="date"
                className={inputClass}
                value={state.targetDate}
                onChange={(e) => update({ targetDate: e.target.value })}
              />
            </Field>
            <Field label="Label">
              <input
                className={inputClass}
                placeholder="Kickoff"
                value={state.countdownLabel}
                onChange={(e) => update({ countdownLabel: e.target.value })}
              />
            </Field>
          </>
        )}
      </div>
    </Section>
  );
}

/* --------------------------------- format ------------------------------- */

function FormatSection({ state, update }: SectionProps) {
  return (
    <Section title="Format">
      <div className="grid grid-cols-3 gap-2.5">
        {FORMATS.map((f) => {
          const active = state.format === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => update({ format: f.id })}
              className={
                "flex flex-col items-center gap-0.5 rounded-lg border px-2 py-3 transition " +
                (active
                  ? "border-brand bg-brand/12 text-ink"
                  : "border-line bg-input text-ink-muted hover:border-line-strong hover:text-ink")
              }
            >
              <span className="font-cond text-[15px] font-bold uppercase tracking-[0.08em]">
                {f.label}
              </span>
              <span className="text-[11px] text-ink-faint">{f.sub}</span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}
