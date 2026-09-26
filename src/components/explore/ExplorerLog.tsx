import { useState } from "react";
import { formatDisplayDate } from "../../lib/presentation";
import type { Lang } from "../../features/localization/strings";
import type { ObjectType, PlanetId } from "../../types/catalog";

export type LogEntry = {
  id: string;
  name: string;
  planet: PlanetId;
  type: ObjectType;
  typeLabel: string;
  mission: string;
  discoveredAt?: string;
  explored: boolean;
};

export type WorldCount = {
  planet: PlanetId;
  total: number;
  found: number;
  explored: number;
  missions: number;
  rovers: number;
};

export function ExplorerLog({
  title,
  entries,
  worlds,
  emptyLabel,
  closeLabel,
  allLabel,
  planetLabels,
  discoveredLabel,
  exploredLabel,
  notExploredLabel,
  progress,
  missionsLabel,
  exploredCountLabel,
  roversLabel,
  lang,
  onSelect,
  onClose,
}: {
  title: string;
  entries: LogEntry[];
  worlds: WorldCount[];
  emptyLabel: string;
  closeLabel: string;
  allLabel: string;
  planetLabels: Record<PlanetId, string>;
  discoveredLabel: string;
  exploredLabel: string;
  notExploredLabel: string;
  progress: string;
  missionsLabel: string;
  exploredCountLabel: string;
  roversLabel: string;
  lang: Lang;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [filter, setFilter] = useState<"all" | PlanetId | ObjectType>("all");
  const types = [...new Set(entries.map((entry) => entry.type))];
  const visible = entries.filter((entry) => filter === "all" || entry.planet === filter || entry.type === filter);

  return (
    <section className="space-y-3" aria-labelledby="explorer-log-title">
      <div className="flex items-start justify-between gap-3">
        <h2 id="explorer-log-title" className="font-display text-2xl">
          {title}
        </h2>
        <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-3 py-1 text-xs">
          {closeLabel}
        </button>
      </div>
      <ul className="space-y-2">
        {worlds.map((world) => (
          <li key={world.planet} className="rounded-xl border border-white/10 px-3 py-2 text-xs leading-5 text-[#c5d2ea]">
            <p className="tracking-[0.14em] text-[#f2a64a] uppercase">{planetLabels[world.planet]}</p>
            <p>{fill(progress, { found: world.found, total: world.total })}</p>
            <p>{fill(exploredCountLabel, { count: world.explored })}</p>
            <p>{fill(missionsLabel, { count: world.missions })}</p>
            {world.rovers > 0 && <p>{fill(roversLabel, { count: world.rovers })}</p>}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-1">
        <FilterChip pressed={filter === "all"} label={allLabel} onClick={() => setFilter("all")} />
        {(["moon", "mars"] as const).map((world) => (
          <FilterChip key={world} pressed={filter === world} label={planetLabels[world]} onClick={() => setFilter(world)} />
        ))}
        {types.map((type) => {
          const sample = entries.find((entry) => entry.type === type);
          if (!sample) return null;
          return <FilterChip key={type} pressed={filter === type} label={sample.typeLabel} onClick={() => setFilter(type)} />;
        })}
      </div>
      {visible.length === 0 ? (
        <p className="text-sm text-[#93a6c9]">{emptyLabel}</p>
      ) : (
        <ul className="space-y-1">
          {visible.map((entry) => (
            <li key={entry.id}>
              <button type="button" onClick={() => onSelect(entry.id)} className="block w-full rounded-xl border border-white/10 px-3 py-2 text-left hover:bg-white/10">
                <span className="block text-sm text-[#f4f7ff]">{entry.name}</span>
                <span className="block text-xs text-[#93a6c9]">
                  {entry.typeLabel} · {entry.mission}
                </span>
                <span className="block text-xs text-[#c5d2ea]">
                  {discoveredLabel}
                  {entry.discoveredAt ? ` ${formatDisplayDate(entry.discoveredAt.slice(0, 10), lang)}` : ""}
                  {" · "}
                  {entry.explored ? exploredLabel : notExploredLabel}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function fill(template: string, values: Record<string, number>) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
}

function FilterChip({ pressed, label, onClick }: { pressed: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className={`rounded-full border px-2.5 py-1 text-[11px] ${pressed ? "border-[#6aa4ff] text-[#6aa4ff]" : "border-white/15 text-[#93a6c9]"}`}>
      {label}
    </button>
  );
}
