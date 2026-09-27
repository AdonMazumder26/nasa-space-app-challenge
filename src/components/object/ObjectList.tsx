import { useEffect, useRef, useState } from "react";
import { LuChevronDown, LuSlidersHorizontal, LuX } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import { missionById } from "../../lib/filtering";
import { typeColor } from "../../lib/presentation";
import type { Artifact, Filters, Mission, ObjectStatus, ObjectType, PlanetId } from "../../types/catalog";

const types: ObjectType[] = ["descent_stage", "lander", "rover", "experiment", "instrument", "impact_hardware"];
const statuses: ObjectStatus[] = ["mission_complete", "communication_lost", "active", "inactive", "impacted", "unknown"];
const statusColor: Record<ObjectStatus, string> = {
  active: "#6aa4ff",
  inactive: "#93a6c9",
  mission_complete: "#f2a64a",
  communication_lost: "#f2a64a",
  destroyed: "#d77979",
  impacted: "#d77979",
  unknown: "#93a6c9",
};

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
  onClose: () => void;
};

export function ObjectList({ planet, objects, total, missions, filters, selectedId, yearBounds, onFilters, onSelect, onClose }: Props) {
  const { t, lang } = useI18n();
  const listRef = useRef<HTMLUListElement>(null);
  const missionMenuRef = useRef<HTMLDivElement>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [missionMenuOpen, setMissionMenuOpen] = useState(false);

  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    const node = listRef.current.querySelector(`[data-object-id="${CSS.escape(selectedId)}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);
  useEffect(() => {
    if (!missionMenuOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!missionMenuRef.current?.contains(event.target as Node)) setMissionMenuOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [missionMenuOpen]);
  const planetMissions = missions.filter((mission) => mission.planet === planet);
  const filtersOn = filters.types.length > 0 || filters.statuses.length > 0 || filters.missionId !== null;

  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#070d1c]/75 shadow-2xl backdrop-blur-md">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">{t.objects}</h2>
            <p className="mt-1 text-xs text-[#93a6c9]">
              {objects.length} / {total} {t.objectCount}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label={t.close} title={t.close} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-[#c5d2ea] transition hover:border-[#6aa4ff]/60 hover:bg-white/10 hover:text-[#f4f7ff]">
            <LuX aria-hidden="true" />
          </button>
        </div>
        <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
          <label className="text-[11px] tracking-[0.16em] text-[#93a6c9] uppercase" htmlFor="year-range">
            {t.throughYear} {filters.throughYear}
          </label>
          <input
            id="year-range"
            type="range"
            min={yearBounds.min}
            max={yearBounds.max}
            value={filters.throughYear}
            onChange={(event) => onFilters({ ...filters, throughYear: Number(event.target.value) })}
            className="mt-2 w-full accent-[#6aa4ff]"
          />
        </div>
      </div>
      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <button type="button" aria-expanded={filtersOpen} aria-controls="object-filters" onClick={() => setFiltersOpen((value) => !value)} className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 text-left text-sm transition hover:border-[#6aa4ff]/50 hover:bg-white/5">
            <LuSlidersHorizontal className="text-[#6aa4ff]" aria-hidden="true" />
            <span>{t.filters}</span>
            {filtersOn && <span className="ml-auto rounded-full bg-[#6aa4ff]/15 px-2 py-0.5 text-xs text-[#6aa4ff]">{filters.types.length + filters.statuses.length + (filters.missionId ? 1 : 0)}</span>}
            <LuChevronDown className={`ml-auto transition-transform ${filtersOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {filtersOn && (
            <button type="button" className="min-h-11 shrink-0 rounded-xl px-2 text-xs text-[#6aa4ff] hover:bg-white/5" onClick={() => onFilters({ ...filters, types: [], statuses: [], missionId: null })}>
              {t.clearFilters}
            </button>
          )}
        </div>
        {filtersOpen && <div id="object-filters" className="mt-3 max-h-[min(42dvh,19rem)] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/15 p-3">
          <div className="flex flex-wrap gap-1.5">
            {types.map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={filters.types.includes(type)}
                onClick={() => onFilters({ ...filters, types: toggle(filters.types, type) })}
                className={`rounded-full border px-2.5 py-1 text-xs ${filters.types.includes(type) ? "border-[#6aa4ff] bg-[#6aa4ff]/20" : "border-white/10"}`}
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
                className={`rounded-full border px-2.5 py-1 text-xs ${filters.statuses.includes(status) ? "border-[#6aa4ff] bg-[#6aa4ff]/20" : "border-white/10"}`}
              >
                {t.statusLabels[status]}
              </button>
            ))}
          </div>
          <label className="sr-only" htmlFor="mission-filter">{t.mission}</label>
          <div ref={missionMenuRef} className="relative">
            <button id="mission-filter" type="button" aria-haspopup="listbox" aria-expanded={missionMenuOpen} onClick={() => setMissionMenuOpen((value) => !value)} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#10182e] px-3 py-2.5 text-left text-sm text-[#f4f7ff] outline-none transition hover:border-[#6aa4ff]/50 focus:border-[#6aa4ff]">
              <span className="truncate">{planetMissions.find((mission) => mission.id === filters.missionId)?.name[lang] ?? t.allMissions}</span>
              <LuChevronDown className={`shrink-0 text-[#93a6c9] transition-transform ${missionMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            {missionMenuOpen && (
              <ul role="listbox" aria-label={t.mission} className="mt-2 max-h-48 overflow-auto rounded-2xl border border-white/15 bg-[#10182e] p-1 shadow-inner">
                <li role="option" aria-selected={!filters.missionId}>
                  <button type="button" onClick={() => { onFilters({ ...filters, missionId: null }); setMissionMenuOpen(false); }} className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${!filters.missionId ? "bg-[#6aa4ff]/15 text-[#6aa4ff]" : "text-[#f4f7ff] hover:bg-white/10"}`}>
                    {t.allMissions}
                  </button>
                </li>
                {planetMissions.map((mission) => (
                  <li key={mission.id} role="option" aria-selected={filters.missionId === mission.id}>
                    <button type="button" onClick={() => { onFilters({ ...filters, missionId: mission.id }); setMissionMenuOpen(false); }} className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${filters.missionId === mission.id ? "bg-[#6aa4ff]/15 text-[#6aa4ff]" : "text-[#f4f7ff] hover:bg-white/10"}`}>
                      {mission.name[lang]}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>}
      </div>
      <ul ref={listRef} className="min-h-0 flex-1 space-y-1 overflow-auto p-2" aria-label={t.objects}>
        {objects.length === 0 && <li className="px-3 py-6 text-sm text-[#93a6c9]">{t.noObjects}</li>}
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
                aria-label={`${object.name[lang]}, ${mission?.name[lang] ?? object.missionId}, ${t.statusLabels[object.status]}`}
                className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${selected ? "border-[#6aa4ff]/60 bg-[#6aa4ff]/12 shadow-[inset_3px_0_0_#6aa4ff]" : "border-transparent hover:border-white/10 hover:bg-white/5"}`}
              >
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: typeColor[object.type] }} />
                <span className="min-w-0">
                  <span className="block text-sm font-medium leading-5 text-[#f4f7ff]">{object.name[lang]}</span>
                  <span className="mt-1 block truncate text-[11px] tracking-[0.08em] text-[#93a6c9] uppercase">{t.typeLabels[object.type]}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#c5d2ea]">
                    <span className="min-w-0 truncate">{mission?.name[lang] ?? object.missionId}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 rounded-full border border-white/10 px-1.5 py-0.5" style={{ color: statusColor[object.status] }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                      {t.statusLabels[object.status]}
                    </span>
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
