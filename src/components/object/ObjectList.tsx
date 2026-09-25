import { useEffect, useRef } from "react";
import { useI18n } from "../../features/localization/LanguageContext";
import { missionById } from "../../lib/filtering";
import { typeColor } from "../../lib/presentation";
import type { Artifact, Filters, Mission, ObjectStatus, ObjectType, PlanetId } from "../../types/catalog";

const types: ObjectType[] = ["descent_stage", "lander", "rover", "experiment", "instrument"];
const statuses: ObjectStatus[] = ["mission_complete", "communication_lost", "active", "inactive", "unknown"];

type Props = {
  planet: PlanetId;
  objects: Artifact[];
  total: number;
  missions: Mission[];
  filters: Filters;
  selectedId: string | null;
  yearBounds: { min: number; max: number };
  onFilters: (filters: Filters) => void;
  onSelect: (id: string) => void;
};

export function ObjectList({ planet, objects, total, missions, filters, selectedId, yearBounds, onFilters, onSelect }: Props) {
  const { t, lang } = useI18n();
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    const node = listRef.current.querySelector(`[data-object-id="${CSS.escape(selectedId)}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);
  const planetMissions = missions.filter((mission) => mission.planet === planet);
  const filtersOn = filters.types.length > 0 || filters.statuses.length > 0 || filters.missionId !== null;

  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-3xl border border-white/10 bg-[#090b10]/75 shadow-2xl backdrop-blur-md">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl">{t.objects}</h2>
          <p className="text-xs text-[#b7b0a4]">
            {objects.length} / {total} {t.objectCount}
          </p>
        </div>
        <div className="mt-3">
          <label className="text-[11px] tracking-[0.16em] text-[#b7b0a4] uppercase" htmlFor="year-range">
            {t.throughYear} {filters.throughYear}
          </label>
          <input
            id="year-range"
            type="range"
            min={yearBounds.min}
            max={yearBounds.max}
            value={filters.throughYear}
            onChange={(event) => onFilters({ ...filters, throughYear: Number(event.target.value) })}
            className="mt-2 w-full accent-[#e39a62]"
          />
        </div>
      </div>
      <div className="space-y-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] tracking-[0.16em] text-[#b7b0a4] uppercase">{t.filters}</p>
          {filtersOn && (
            <button type="button" className="text-xs text-[#e39a62]" onClick={() => onFilters({ ...filters, types: [], statuses: [], missionId: null })}>
              {t.clearFilters}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {types.map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={filters.types.includes(type)}
              onClick={() => onFilters({ ...filters, types: toggle(filters.types, type) })}
              className={`rounded-full border px-2.5 py-1 text-xs ${filters.types.includes(type) ? "border-[#e39a62] bg-[#e39a62]/20" : "border-white/10"}`}
            >
              {t.typeLabels[type]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={filters.statuses.includes(status)}
              onClick={() => onFilters({ ...filters, statuses: toggle(filters.statuses, status) })}
              className={`rounded-full border px-2.5 py-1 text-xs ${filters.statuses.includes(status) ? "border-[#e39a62] bg-[#e39a62]/20" : "border-white/10"}`}
            >
              {t.statusLabels[status]}
            </button>
          ))}
        </div>
        <label className="sr-only" htmlFor="mission-filter">
          {t.mission}
        </label>
        <select
          id="mission-filter"
          value={filters.missionId ?? ""}
          onChange={(event) => onFilters({ ...filters, missionId: event.target.value || null })}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
        >
          <option value="">{t.allMissions}</option>
          {planetMissions.map((mission) => (
            <option key={mission.id} value={mission.id}>
              {mission.name[lang]}
            </option>
          ))}
        </select>
      </div>
      <ul ref={listRef} className="min-h-0 flex-1 overflow-auto p-2" aria-label={t.objects}>
        {objects.length === 0 && <li className="px-3 py-6 text-sm text-[#b7b0a4]">{t.noObjects}</li>}
        {objects.map((object) => {
          const mission = missionById(missions, object.missionId);
          const selected = object.id === selectedId;
          return (
            <li key={object.id}>
              <button
                type="button"
                data-object-id={object.id}
                onClick={() => onSelect(object.id)}
                aria-current={selected ? "true" : undefined}
                className={`flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left ${selected ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: typeColor[object.type] }} />
                <span className="min-w-0">
                  <span className="block truncate text-sm">{object.name[lang]}</span>
                  <span className="block truncate text-xs text-[#b7b0a4]">
                    {mission?.name[lang]} · {t.statusLabels[object.status]}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
