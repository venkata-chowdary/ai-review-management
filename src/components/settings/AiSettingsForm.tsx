"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card, Note, SectionTitle } from "@/components/ui/Display";
import { Field, SettingRow, TextArea } from "@/components/ui/Field";
import { Menu } from "@/components/ui/Menu";
import { Segmented } from "@/components/ui/Segmented";
import { Icon } from "@/components/icons/Icon";
import type { Location, Tone } from "@/lib/mock/types";

type Rule = "2" | "3" | "all";
type Override = { tone: Tone | "default"; rule: Rule | "default" };

const ruleOptions: { value: Rule; label: string }[] = [
  { value: "2", label: "2★ or lower" },
  { value: "3", label: "3★ or lower" },
  { value: "all", label: "Every review" },
];

/** Global reply defaults with per-location overrides. Saving is simulated. */
export function AiSettingsForm({ locations, tones }: { locations: Location[]; tones: Tone[] }) {
  const [tone, setTone] = useState<Tone>("Warm");
  const [rule, setRule] = useState<Rule>("3");
  const [auto, setAuto] = useState<"off" | "on">("off");
  const [instructions, setInstructions] = useState("Sign off as “The Harbour Kitchen team”. Never offer refunds or discounts in a reply.");
  const [overrides, setOverrides] = useState<Record<string, Override>>({
    airport: { tone: "Professional", rule: "all" },
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function setOverride(id: string, patch: Partial<Override>) {
    setSaved(false);
    setOverrides((o) => ({ ...o, [id]: { ...(o[id] ?? { tone: "default", rule: "default" }), ...patch } }));
  }

  return (
    <form
      className="flex flex-col gap-3.5"
      onChange={() => setSaved(false)}
      onSubmit={(e) => {
        e.preventDefault();
        setSaving(true);
        timer.current = setTimeout(() => {
          setSaving(false);
          setSaved(true);
        }, 900);
      }}
    >
      <Card className="px-5 py-5">
        <SectionTitle>Defaults for all locations</SectionTitle>
        <div className="mt-4">
          <SettingRow title="Reply tone" description="How AI drafts sound. You can still change the tone on any draft.">
            <div role="group" aria-label="Reply tone" className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <Chip
                  key={t}
                  pressed={t === tone}
                  onClick={() => {
                    setTone(t);
                    setSaved(false);
                  }}
                >
                  {t}
                </Chip>
              ))}
            </div>
          </SettingRow>
          <SettingRow title="Needs your approval" description="Drafts for these reviews wait for you before anything is posted.">
            <Segmented
              label="Needs your approval"
              value={rule}
              options={ruleOptions}
              onChange={(v) => {
                setRule(v);
                setSaved(false);
              }}
            />
          </SettingRow>
          <SettingRow
            title="Auto-publish other replies"
            description="When on, replies to reviews outside your approval rule are posted on Google without review. Sensitive reviews are always held."
          >
            <Segmented
              label="Auto-publish other replies"
              value={auto}
              options={[
                { value: "off", label: "Off" },
                { value: "on", label: "On" },
              ]}
              onChange={(v) => {
                setAuto(v);
                setSaved(false);
              }}
            />
          </SettingRow>
          <div className="border-t border-line pt-4">
            <Field label="Custom instructions" hint="Optional. Added to every draft." htmlFor="ai-instructions">
              <TextArea id="ai-instructions" rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} maxLength={500} />
            </Field>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <SectionTitle>Location overrides</SectionTitle>
          <p className="text-[12.5px] text-fg-muted">Anything set here replaces the defaults for that location.</p>
        </div>
        <ul className="border-t border-line">
          {locations.map((l) => {
            const o = overrides[l.id] ?? { tone: "default", rule: "default" };
            const custom = o.tone !== "default" || o.rule !== "default";
            return (
              <li key={l.id} className="flex flex-col gap-3 border-b border-line px-5 py-3.5 last:border-b-0 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-[34px] flex-none place-items-center rounded-pill bg-subtle text-fg-muted">
                    <Icon name="store" />
                  </span>
                  <div>
                    <p className="font-bold">{l.name}</p>
                    <p className="text-[12px] text-fg-muted">{custom ? "Custom settings" : "Uses defaults"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Menu
                    label={`Tone for ${l.name}`}
                    value={o.tone}
                    options={[{ value: "default", label: `Default (${tone})` }, ...tones.map((t) => ({ value: t, label: t }))]}
                    onChange={(v) => setOverride(l.id, { tone: v as Override["tone"] })}
                    triggerClassName="inline-flex h-control-sm items-center gap-1.5 rounded-pill bg-surface px-3.5 text-[13px] font-semibold shadow-button-light hover:bg-row-hover"
                    trigger={(c) => (
                      <>
                        Tone: {o.tone === "default" ? "Default" : c?.label}
                        <Icon name="chevron-down" size={14} />
                      </>
                    )}
                  />
                  <Menu
                    label={`Approval rule for ${l.name}`}
                    value={o.rule}
                    align="end"
                    options={[
                      { value: "default", label: `Default (${ruleOptions.find((r) => r.value === rule)?.label})` },
                      ...ruleOptions,
                    ]}
                    onChange={(v) => setOverride(l.id, { rule: v as Override["rule"] })}
                    triggerClassName="inline-flex h-control-sm items-center gap-1.5 rounded-pill bg-surface px-3.5 text-[13px] font-semibold shadow-button-light hover:bg-row-hover"
                    trigger={(c) => (
                      <>
                        Approval: {o.rule === "default" ? "Default" : c?.label}
                        <Icon name="chevron-down" size={14} />
                      </>
                    )}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Note icon="shield">AI never promises refunds, compensation or private details. Drafts stay unpublished until approved or allowed by your rules.</Note>
        <div className="flex items-center gap-3">
          <span role="status" aria-live="polite" className="text-[12px] font-semibold text-success">
            {saved && "Saved (demo only)"}
          </span>
          <Button type="submit" variant="primary" size="md" icon="check" iconMotion="draw" loading={saving} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
