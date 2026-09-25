import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { LuInfo, LuMaximize, LuMinus, LuPlus, LuRotateCcw } from "react-icons/lu";
import { ObjectList } from "../components/object/ObjectList";
import { StoryPanel } from "../components/object/StoryPanel";
import { PlanetViewport, type SceneHandle } from "../components/planet/PlanetScene";
import { SearchBox } from "../components/search/SearchBox";
import { TimelineBar } from "../components/timeline/TimelineBar";
import { TopBar } from "../components/layout/TopBar";
import { catalog } from "../data/catalog";
import { useI18n } from "../features/localization/LanguageContext";
import { useMinWidth, usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { yearOf } from "../lib/coordinates/latLon";
import { catalogYearBounds, filterObjects, missionById } from "../lib/filtering";
import type { Artifact, Filters, PlanetId, TimelineEvent } from "../types/catalog";

export function ExplorePage() {
  const { planet: planetParam } = useParams();
  const planet: PlanetId | null = planetParam === "moon" || planetParam === "mars" ? planetParam : null;
  if (!planet) return <Navigate to="/explore/moon" replace />;
  return <Explorer planet={planet} />;
}

function Explorer({ planet }: { planet: PlanetId }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const reduced = usePrefersReducedMotion();
  const desktop = useMinWidth(1024);
  const sceneRef = useRef<SceneHandle | null>(null);
  const bounds = useMemo(() => catalogYearBounds(catalog.missions), []);
  const [filters, setFilters] = useState<Filters>({ types: [], statuses: [], missionId: null, throughYear: bounds.max });
  const [autoRotate, setAutoRotate] = useState(!reduced);
  const [listOpen, setListOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [focusNonce, setFocusNonce] = useState(0);
  const selectedId = searchParams.get("object");

  useEffect(() => {
    if (reduced) setAutoRotate(false);
  }, [reduced]);

  useEffect(() => {
    setFilters((current) => ({ ...current, missionId: null }));
  }, [planet]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHelpOpen(false);
        setListOpen(false);
        if (selectedId) setSearchParams({}, { replace: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, setSearchParams]);

  const filtered = useMemo(
    () => filterObjects(catalog.objects, catalog.missions, planet, "", filters),
    [planet, filters],
  );
  const selected = catalog.objects.find((object) => object.id === selectedId && object.planet === planet) ?? null;
  const markers = selected && !filtered.some((object) => object.id === selected.id) ? [...filtered, selected] : filtered;
  const planetTotal = catalog.objects.filter((object) => object.planet === planet).length;
  const events = catalog.events.filter((event) => catalog.objects.find((object) => object.id === event.objectId)?.planet === planet);

  const selectObject = (object: Artifact, reveal = true) => {
    if (reveal) {
      const arrival = yearOf(missionById(catalog.missions, object.missionId)?.arrivalDate) ?? filters.throughYear;
      setFilters((current) => ({
        ...current,
        throughYear: Math.max(current.throughYear, arrival),
        types: current.types.length > 0 && !current.types.includes(object.type) ? [] : current.types,
        statuses: current.statuses.length > 0 && !current.statuses.includes(object.status) ? [] : current.statuses,
        missionId: current.missionId && current.missionId !== object.missionId ? null : current.missionId,
      }));
    }
    setFocusNonce((value) => value + 1);
    setListOpen(false);
    if (object.planet !== planet) {
      navigate(`/explore/${object.planet}?object=${object.id}`);
      return;
    }
    setSearchParams({ object: object.id }, { replace: true });
  };

  const openEvent = (event: TimelineEvent) => {
    const object = catalog.objects.find((item) => item.id === event.objectId);
    if (!object) return;
    const year = Number(event.date.slice(0, 4));
    setFilters((current) => ({ ...current, throughYear: Math.max(current.throughYear, year) }));
    selectObject(object);
  };

  return (
    <div className="relative h-dvh overflow-hidden">
      <div className="absolute inset-x-0 top-16 bottom-0">
        <PlanetViewport
          planet={planet}
          objects={markers}
          selectedId={selected?.id ?? null}
          focusNonce={focusNonce}
          autoRotate={autoRotate}
          reducedMotion={reduced}
          errorMessage={t.sceneError}
          loadingLabel={t.loadingSurface}
          clusterHint={t.clusterChoose}
          labelFor={(object) => object.name[lang]}
          onSelect={(id) => {
            const object = catalog.objects.find((item) => item.id === id);
            if (object) selectObject(object, false);
          }}
          sceneRef={sceneRef}
        />
      </div>
      <TopBar planet={planet} onPlanet={(next) => navigate(`/explore/${next}`)} />
      <div className="pointer-events-none absolute inset-x-0 top-16 bottom-0 z-20">
        <div className="pointer-events-auto absolute top-3 right-3 left-3 sm:left-auto sm:w-80">
          <SearchBox objects={catalog.objects} missions={catalog.missions} onSelect={(object) => selectObject(object)} />
        </div>
        <div className={`pointer-events-auto absolute bottom-28 left-3 w-[min(340px,calc(100%-1.5rem))] ${desktop ? "top-3" : "top-16"} ${desktop || listOpen ? "flex" : "hidden"}`}>
          <ObjectList
            planet={planet}
            objects={filtered}
            total={planetTotal}
            missions={catalog.missions}
            filters={filters}
            selectedId={selected?.id ?? null}
            yearBounds={bounds}
            onFilters={(next) => setFilters({ ...next, missionId: next.missionId })}
            onSelect={(id) => {
              const object = catalog.objects.find((item) => item.id === id);
              if (object) selectObject(object, false);
            }}
          />
        </div>
        {!desktop && (
          <button
            type="button"
            className="pointer-events-auto absolute bottom-28 left-3 rounded-full border border-white/15 bg-black/70 px-4 py-2 text-sm"
            onClick={() => setListOpen((open) => !open)}
          >
            {t.openList}
          </button>
        )}
        <div className={`pointer-events-auto absolute bottom-36 flex flex-col gap-2 ${desktop ? "left-[348px]" : "right-3"}`}>
          <ControlButton label={t.zoomIn} onClick={() => sceneRef.current?.zoomIn()}>
            <LuPlus />
          </ControlButton>
          <ControlButton label={t.zoomOut} onClick={() => sceneRef.current?.zoomOut()}>
            <LuMinus />
          </ControlButton>
          <ControlButton label={t.resetView} onClick={() => sceneRef.current?.reset()}>
            <LuRotateCcw />
          </ControlButton>
          <ControlButton label={t.autoRotate} pressed={autoRotate} onClick={() => setAutoRotate((value) => !value)}>
            <span className="text-[10px]">{autoRotate ? "ON" : "OFF"}</span>
          </ControlButton>
          <ControlButton
            label={t.fullscreen}
            onClick={() => {
              if (document.fullscreenElement) void document.exitFullscreen();
              else void document.documentElement.requestFullscreen();
            }}
          >
            <LuMaximize />
          </ControlButton>
          <ControlButton label={t.help} onClick={() => setHelpOpen(true)}>
            <LuInfo />
          </ControlButton>
        </div>
        {!(selected && !desktop) && (
          <div className={`pointer-events-auto absolute right-3 bottom-3 left-3 lg:left-[360px] ${selected && desktop ? "lg:right-[424px]" : ""}`}>
            <TimelineBar events={events} activeId={selected?.id ?? null} onSelect={openEvent} />
          </div>
        )}
      </div>
      {selected && (
        <StoryPanel
          object={selected}
          missions={catalog.missions}
          sources={catalog.sources}
          mobile={!desktop}
          reducedMotion={reduced}
          onClose={() => setSearchParams({}, { replace: true })}
        />
      )}
      {helpOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setHelpOpen(false)}>
          <div className="max-w-md rounded-3xl border border-white/10 bg-[#12151c] p-6" role="dialog" aria-labelledby="help-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="help-title" className="font-display text-3xl">
              {t.helpTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#d9d2c6]">{t.howToBody}</p>
            {reduced && <p className="mt-3 text-sm text-[#e39a62]">{t.reducedMotion}</p>}
            <button type="button" className="mt-5 rounded-full bg-[#f3efe6] px-4 py-2 text-sm text-[#1a140f]" onClick={() => setHelpOpen(false)}>
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-full border bg-black/70 text-sm ${pressed ? "border-[#e39a62]" : "border-white/15"}`}
    >
      {children}
    </button>
  );
}
