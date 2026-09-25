import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { LuMinus, LuPlus, LuRotateCcw } from "react-icons/lu";
import { ObjectList } from "../components/object/ObjectList";
import { StoryPanel } from "../components/object/StoryPanel";
import { PlanetViewport, webglAvailable, type SceneHandle } from "../components/planet/PlanetScene";
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
  const [drawer, setDrawer] = useState<"list" | "timeline" | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [focusNonce, setFocusNonce] = useState(0);
  const [emphasisNonce, setEmphasisNonce] = useState(0);
  const [holdSpin, setHoldSpin] = useState(false);
  const [tour, setTour] = useState(false);
  // Without a globe the camera controls have nothing to act on.
  const [webgl] = useState(webglAvailable);
  const [veil, setVeil] = useState(false);
  const veilTimers = useRef<number[]>([]);
  const selectedId = searchParams.get("object");
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  useEffect(() => {
    if (!selectedId) {
      setHoldSpin(false);
      return;
    }
    setHoldSpin(true);
    if (reduced) return;
    const timer = window.setTimeout(() => setHoldSpin(false), 8000);
    return () => window.clearTimeout(timer);
  }, [selectedId, reduced]);

  useEffect(() => {
    if (reduced) setAutoRotate(false);
  }, [reduced]);

  useEffect(() => {
    setFilters((current) => ({ ...current, missionId: null }));
    setDrawer(null);
    setTour(false);
  }, [planet]);

  useEffect(
    () => () => {
      veilTimers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const layer = useRef({ help: false, drawer: null as "list" | "timeline" | null, tour: false });
  layer.current = { help: helpOpen, drawer, tour };
  const selectRef = useRef<(object: Artifact, reveal?: boolean) => void>(() => undefined);
  const applyRef = useRef<(object: Artifact, reveal?: boolean) => void>(() => undefined);
  // setSearchParams changes identity with the query string, which would restart the tour on every hop.
  const paramsRef = useRef(setSearchParams);
  paramsRef.current = setSearchParams;
  const neighbors = useRef<{ previous: Artifact | null; next: Artifact | null }>({ previous: null, next: null });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key === "Escape") {
        if (layer.current.help) {
          setHelpOpen(false);
          return;
        }
        if (layer.current.tour) {
          setTour(false);
          return;
        }
        if (layer.current.drawer) {
          setDrawer(null);
          return;
        }
        if (selectedIdRef.current) setSearchParams({}, { replace: true });
        return;
      }
      if (!selectedIdRef.current) return;
      if (event.key === "ArrowLeft" && neighbors.current.previous) {
        event.preventDefault();
        selectRef.current(neighbors.current.previous, false);
      } else if (event.key === "ArrowRight" && neighbors.current.next) {
        event.preventDefault();
        selectRef.current(neighbors.current.next, false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchParams]);

  const filtered = useMemo(
    () => filterObjects(catalog.objects, catalog.missions, planet, "", filters),
    [planet, filters],
  );
  const tourOrder = useMemo(() => {
    const arrivalOf = (object: Artifact) => missionById(catalog.missions, object.missionId)?.arrivalDate ?? "9999";
    return catalog.objects
      .filter((object) => object.planet === planet)
      .sort((a, b) => arrivalOf(a).localeCompare(arrivalOf(b)) || a.id.localeCompare(b.id));
  }, [planet]);
  const selected = catalog.objects.find((object) => object.id === selectedId && object.planet === planet) ?? null;
  const markers = selected && !filtered.some((object) => object.id === selected.id) ? [...filtered, selected] : filtered;
  const planetTotal = catalog.objects.filter((object) => object.planet === planet).length;
  const events = catalog.events.filter((event) => catalog.objects.find((object) => object.id === event.objectId)?.planet === planet);

  const applySelection = (object: Artifact, reveal = true) => {
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
    setDrawer(null);
    if (object.planet !== planet) {
      navigate(`/explore/${object.planet}?object=${object.id}`);
      return;
    }
    setSearchParams({ object: object.id }, { replace: true });
  };

  const selectObject = (object: Artifact, reveal = true) => {
    setTour(false);
    applySelection(object, reveal);
  };

  const openEvent = (event: TimelineEvent) => {
    const object = catalog.objects.find((item) => item.id === event.objectId);
    if (!object) return;
    const year = Number(event.date.slice(0, 4));
    setFilters((current) => ({ ...current, throughYear: Math.max(current.throughYear, year) }));
    setEmphasisNonce((value) => value + 1);
    selectObject(object);
  };

  const closeStory = () => {
    setTour(false);
    if (!selectedIdRef.current) return;
    setSearchParams({}, { replace: true });
  };

  applyRef.current = applySelection;

  useEffect(() => {
    if (!tour || tourOrder.length === 0) return;
    let index = 0;
    applyRef.current(tourOrder[0], false);
    const timer = window.setInterval(() => {
      index += 1;
      if (index >= tourOrder.length) {
        window.clearInterval(timer);
        setTour(false);
        paramsRef.current({}, { replace: true });
        return;
      }
      applyRef.current(tourOrder[index], false);
    }, reduced ? 4200 : 7000);
    return () => window.clearInterval(timer);
  }, [tour, tourOrder, reduced]);

  const toggleTour = () => {
    if (tour) {
      setTour(false);
      return;
    }
    setFilters({ types: [], statuses: [], missionId: null, throughYear: bounds.max });
    setDrawer(null);
    setTour(true);
  };

  const switchPlanet = (next: PlanetId) => {
    if (next === planet || veil) return;
    if (reduced) {
      navigate(`/explore/${next}`);
      return;
    }
    setVeil(true);
    const fadeIn = window.setTimeout(() => {
      navigate(`/explore/${next}`);
      const fadeOut = window.setTimeout(() => setVeil(false), 180);
      veilTimers.current.push(fadeOut);
    }, 260);
    veilTimers.current.push(fadeIn);
  };

  const sequence = selected && filtered.some((object) => object.id === selected.id) ? filtered : markers;
  const selectedIndex = selected ? sequence.findIndex((object) => object.id === selected.id) : -1;
  const previous = selectedIndex > 0 ? sequence[selectedIndex - 1] : null;
  const next = selectedIndex >= 0 && selectedIndex < sequence.length - 1 ? sequence[selectedIndex + 1] : null;
  selectRef.current = selectObject;
  neighbors.current = { previous, next };
  const years = events.map((event) => Number(event.date.slice(0, 4))).filter((year) => !Number.isNaN(year));
  const yearMin = years.length > 0 ? Math.min(...years) : bounds.min;
  const yearMax = years.length > 0 ? Math.max(...years) : bounds.max;
  const listVisible = drawer === "list";
  const timelineVisible = drawer === "timeline";
  const showDock = desktop || !selected;

  const toggleDrawer = (nextDrawer: "list" | "timeline") => {
    setDrawer((current) => (current === nextDrawer ? null : nextDrawer));
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen();
  };

  return (
    <div className="relative h-dvh overflow-hidden">
      <div className="absolute inset-x-0 top-16 bottom-0">
        <PlanetViewport
          planet={planet}
          objects={markers}
          selectedId={selected?.id ?? null}
          focusNonce={focusNonce}
          emphasisNonce={emphasisNonce}
          intro={false}
          autoRotate={autoRotate && !holdSpin}
          reducedMotion={reduced}
          errorMessage={t.sceneError}
          loadingLabel={t.loadingSurface}
          clusterHint={t.clusterChoose}
          labelFor={(object) => object.name[lang]}
          onSelect={(id) => {
            const object = catalog.objects.find((item) => item.id === id);
            if (object) selectObject(object, false);
          }}
          onEmptyClick={closeStory}
          sceneRef={sceneRef}
        />
      </div>
      <div
        className={`pointer-events-none absolute inset-x-0 top-16 bottom-0 z-10 bg-[radial-gradient(circle_at_center,transparent_16%,rgba(0,0,0,0.58)_78%)] transition-opacity duration-700 ${selected ? "opacity-100" : "opacity-0"}`}
      />
      <TopBar planet={planet} onPlanet={switchPlanet} dimmed={Boolean(selected)} onHelp={() => setHelpOpen(true)} onFullscreen={toggleFullscreen} />
      <div className={`pointer-events-none absolute inset-x-0 top-16 bottom-0 z-20 transition-opacity duration-500 ${selected ? "opacity-60" : ""}`}>
        <div className="pointer-events-auto absolute top-3 right-3">
          <SearchBox objects={catalog.objects} missions={catalog.missions} onSelect={(object) => selectObject(object)} />
        </div>
        <div
          inert={listVisible ? undefined : true}
          className={`pointer-events-auto absolute bottom-28 left-3 flex transition duration-500 ${desktop ? "top-3 w-[min(340px,calc(100%-1.5rem))]" : "top-14 right-3"} ${
            listVisible ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-[120%] opacity-0"
          }`}
        >
          <ObjectList
            planet={planet}
            objects={filtered}
            total={planetTotal}
            missions={catalog.missions}
            filters={filters}
            selectedId={selected?.id ?? null}
            yearBounds={bounds}
            onFilters={(nextFilters) => setFilters({ ...nextFilters, missionId: nextFilters.missionId })}
            onSelect={(id) => {
              const object = catalog.objects.find((item) => item.id === id);
              if (object) selectObject(object, false);
            }}
          />
        </div>
        {showDock && (
          <div className={`pointer-events-auto absolute bottom-3 left-3 flex flex-col gap-2 ${selected && desktop ? "right-[27rem]" : "right-3"}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-pressed={drawer === "list"}
                  onClick={() => toggleDrawer("list")}
                  className={`rounded-full border px-3 py-2 text-sm ${drawer === "list" ? "border-[#e39a62] bg-[#e39a62]/15" : "border-white/15 bg-black/70"}`}
                >
                  {t.objects}
                </button>
                <button
                  type="button"
                  aria-pressed={tour}
                  onClick={toggleTour}
                  className={`rounded-full border px-3 py-2 text-sm ${tour ? "border-[#e39a62] bg-[#e39a62]/15 text-[#e39a62]" : "border-white/15 bg-black/70"}`}
                >
                  {tour ? t.stopTour : t.tour}
                </button>
              </div>
              {webgl && (
              <CameraCluster
                zoomInLabel={t.zoomIn}
                zoomOutLabel={t.zoomOut}
                resetLabel={t.resetView}
                spinLabel={t.autoRotate}
                spinning={autoRotate}
                onZoomIn={() => sceneRef.current?.zoomIn()}
                onZoomOut={() => sceneRef.current?.zoomOut()}
                onReset={() => {
                  if (selectedIdRef.current) closeStory();
                  else sceneRef.current?.reset();
                }}
                onSpin={() => setAutoRotate((value) => !value)}
              />
              )}
            </div>
            {timelineVisible && <TimelineBar events={events} activeId={selected?.id ?? null} onSelect={openEvent} />}
            <button
              type="button"
              aria-expanded={timelineVisible}
              aria-label={t.timeline}
              onClick={() => toggleDrawer("timeline")}
              className={`flex h-9 items-center gap-3 rounded-full border px-4 text-xs tracking-[0.14em] ${timelineVisible ? "border-[#e39a62] bg-[#e39a62]/15 text-[#e39a62]" : "border-white/10 bg-[#090b10]/80 text-[#e39a62]"}`}
            >
              <span>{yearMin}</span>
              <span className="h-px flex-1 bg-[#e39a62]/70" />
              <span className="uppercase">{t.timeline}</span>
              <span className="h-px flex-1 bg-[#e39a62]/70" />
              <span>{yearMax}</span>
            </button>
          </div>
        )}
        {!desktop && selected && (
          <div className="pointer-events-auto absolute right-3 bottom-[calc(56dvh+0.75rem)] flex items-center gap-2">
            {tour && (
              <button
                type="button"
                onClick={toggleTour}
                className="rounded-full border border-[#e39a62] bg-[#e39a62]/15 px-3 py-2 text-sm text-[#e39a62]"
              >
                {t.stopTour}
              </button>
            )}
            {webgl && (
            <CameraCluster
              zoomInLabel={t.zoomIn}
              zoomOutLabel={t.zoomOut}
              resetLabel={t.resetView}
              spinLabel={t.autoRotate}
              spinning={autoRotate}
              onZoomIn={() => sceneRef.current?.zoomIn()}
              onZoomOut={() => sceneRef.current?.zoomOut()}
              onReset={() => {
                if (selectedIdRef.current) closeStory();
                else sceneRef.current?.reset();
              }}
              onSpin={() => setAutoRotate((value) => !value)}
            />
            )}
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
          onClose={closeStory}
          onPrevious={previous ? () => selectObject(previous, false) : null}
          onNext={next ? () => selectObject(next, false) : null}
        />
      )}
      <div className={`absolute inset-0 z-[70] bg-black transition-opacity duration-200 ${veil ? "opacity-100" : "pointer-events-none opacity-0"}`} />
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

function CameraCluster({
  zoomInLabel,
  zoomOutLabel,
  resetLabel,
  spinLabel,
  spinning,
  onZoomIn,
  onZoomOut,
  onReset,
  onSpin,
}: {
  zoomInLabel: string;
  zoomOutLabel: string;
  resetLabel: string;
  spinLabel: string;
  spinning: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onSpin: () => void;
}) {
  return (
    <div className="flex items-center rounded-full border border-white/15 bg-black/70">
      <ClusterButton label={zoomInLabel} onClick={onZoomIn}>
        <LuPlus />
      </ClusterButton>
      <ClusterButton label={zoomOutLabel} onClick={onZoomOut}>
        <LuMinus />
      </ClusterButton>
      <ClusterButton label={resetLabel} onClick={onReset}>
        <LuRotateCcw />
      </ClusterButton>
      <ClusterButton label={spinLabel} pressed={spinning} onClick={onSpin}>
        <span className="text-[10px]">{spinning ? "ON" : "OFF"}</span>
      </ClusterButton>
    </div>
  );
}

function ClusterButton({
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
      className={`grid h-9 w-9 place-items-center text-sm ${pressed ? "text-[#e39a62]" : "text-[#f3efe6]"}`}
    >
      {children}
    </button>
  );
}
