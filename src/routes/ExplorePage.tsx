import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { LuBookOpen, LuCompass, LuMap, LuMenu, LuMinus, LuPlus, LuRoute, LuRotateCcw, LuScan, LuX } from "react-icons/lu";
import { ObjectList } from "../components/object/ObjectList";
import { StoryPanel } from "../components/object/StoryPanel";
import { PlanetViewport, webglAvailable, type SceneHandle } from "../components/planet/PlanetScene";
import { SearchBox } from "../components/search/SearchBox";
import { TimelineBar } from "../components/timeline/TimelineBar";
import { TopBar } from "../components/layout/TopBar";
import { ExpeditionPanel } from "../components/explore/ExpeditionPanel";
import { ExplorerLog } from "../components/explore/ExplorerLog";
import { Minimap } from "../components/explore/Minimap";
import { ScanPanel } from "../components/explore/ScanPanel";
import { catalog } from "../data/catalog";
import { roverRoutes } from "../data/roverRoutes";
import { useI18n } from "../features/localization/LanguageContext";
import { fillCopy } from "../features/localization/strings";
import { useMinWidth, usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { yearOf } from "../lib/coordinates/latLon";
import { formatDistanceKm, surfaceDistanceKm } from "../lib/coordinates/distance";
import {
  markDiscovered,
  markExplored,
  moveExpeditionSite,
  pickDiscovery,
  readExploration,
  scanAngle,
  sitesFacing,
  toggleExpeditionSite,
  writeExploration,
  type Expedition,
  type ExplorationSave,
  type FlightPhase,
  type SurfaceView,
} from "../lib/exploration";
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
  const [discovery, setDiscovery] = useState(true);
  const [progress, setProgress] = useState<ExplorationSave>(() => readExploration());
  const [flight, setFlight] = useState<FlightPhase>(() => (searchParams.get("object") && !reduced ? "locating" : "idle"));
  const [notice, setNotice] = useState<string | null>(null);
  const [view, setView] = useState<SurfaceView>({ level: "global", distance: 2.8, inView: 0, latitude: 0, longitude: 0 });
  const [panel, setPanel] = useState<null | "log" | "expedition" | "scan">(null);
  const [scanning, setScanning] = useState(false);
  const [scanIds, setScanIds] = useState<string[] | null>(null);
  const [seeking, setSeeking] = useState(false);
  const [archiveFull, setArchiveFull] = useState(false);
  const [mapOpen, setMapOpen] = useState(desktop);
  const [toolsOpen, setToolsOpen] = useState(false);
  const seekTurn = useRef(0);
  const noticeTimer = useRef<number | null>(null);
  const ignoreEmptyUntil = useRef(0);
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

  const planetBoot = useRef(true);
  useEffect(() => {
    if (planetBoot.current) {
      planetBoot.current = false;
      return;
    }
    setFilters((current) => ({ ...current, missionId: null }));
    setDrawer(null);
    setTour(false);
    setFlight("idle");
    setNotice(null);
    setPanel(null);
    setScanIds(null);
    setArchiveFull(false);
    setView({ level: "global", distance: 2.8, inView: 0, latitude: 0, longitude: 0 });
  }, [planet]);

  useEffect(
    () =>     () => {
      veilTimers.current.forEach((timer) => window.clearTimeout(timer));
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    },
    [],
  );

  const layer = useRef({ help: false, drawer: null as "list" | "timeline" | null, tour: false, panel: null as typeof panel });
  layer.current = { help: helpOpen, drawer, tour, panel };
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
        if (layer.current.panel) {
          setPanel(null);
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
  const missionFocus = searchParams.get("mission");
  const missionMembers = missionFocus
    ? catalog.objects.filter((object) => object.planet === planet && object.missionId === missionFocus)
    : [];
  const markers = [...filtered];
  for (const object of [selected, ...missionMembers]) {
    if (object && !markers.some((item) => item.id === object.id)) markers.push(object);
  }
  const planetTotal = catalog.objects.filter((object) => object.planet === planet).length;
  const events = catalog.events.filter((event) => catalog.objects.find((object) => object.id === event.objectId)?.planet === planet);

  const discovered = Object.keys(progress.records);
  const expedition = progress.expeditions[planet] ?? null;

  const revise = (recipe: (current: ExplorationSave) => ExplorationSave) => {
    setProgress((current) => {
      const next = recipe(current);
      if (next === current) return current;
      writeExploration(next);
      return next;
    });
  };

  const remember = (ids: string[]) => {
    revise((current) => markDiscovered(current, ids, new Date().toISOString()));
  };

  const applySelection = (object: Artifact, reveal = true, missionId?: string) => {
    remember([object.id]);
    if (!reduced) setFlight("locating");
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
    ignoreEmptyUntil.current = performance.now() + 700;
    const mission = missionId ?? searchParams.get("mission");
    const keepMission = mission && mission === object.missionId ? mission : null;
    if (object.planet !== planet) {
      navigate(`/explore/${object.planet}?object=${object.id}`);
      return;
    }
    const next: Record<string, string> = { object: object.id };
    if (keepMission) next.mission = keepMission;
    setSearchParams(next, { replace: true });
  };

  const selectObject = (object: Artifact, reveal = true, missionId?: string) => {
    setTour(false);
    applySelection(object, reveal, missionId);
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
    if (performance.now() < ignoreEmptyUntil.current) return;
    setTour(false);
    setFlight("idle");
    if (!selectedIdRef.current) return;
    setSearchParams({}, { replace: true });
  };

  const locale = lang === "bn" ? "bn-BD" : "en-GB";
  const countText = (count: number) => count.toLocaleString(locale);

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
  const storyReady = Boolean(selected) && (!webgl || reduced || flight === "idle");

  useEffect(() => {
    if (!storyReady || !selectedId) return;
    setProgress((current) => {
      const next = markExplored(current, selectedId, new Date().toISOString());
      if (next === current) return current;
      writeExploration(next);
      return next;
    });
  }, [storyReady, selectedId]);
  const showDock = desktop || !storyReady;
  const nearby = useMemo(() => {
    if (!selected) return [];
    return catalog.objects
      .filter((object) => object.planet === selected.planet && object.id !== selected.id)
      .map((object) => ({
        object,
        km: surfaceDistanceKm(
          selected.planet,
          selected.location.latitude,
          selected.location.longitude,
          object.location.latitude,
          object.location.longitude,
        ),
      }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 4)
      .map(({ object, km }) => ({
        id: object.id,
        name: object.name[lang],
        distance: formatDistanceKm(km, lang, t.kilometers),
      }));
  }, [selected, lang, t.kilometers]);
  const viewTitle =
    (view.level === "artifact" || view.level === "site") && selected
      ? selected.name[lang]
      : view.level === "region" && selected?.location.region
        ? selected.location.region
        : t[planet];
  const viewNote =
    view.level === "artifact" && selected
      ? t.typeLabels[selected.type]
      : view.level === "global"
        ? `${countText(planetTotal)} ${t.objects}`
        : fillCopy(t.inView, { count: countText(view.inView) });
  const viewKicker = { global: t.viewGlobal, region: t.viewRegion, site: t.viewSite, artifact: t.viewArtifact }[view.level];

  const changeExpedition = (next: Expedition | null) => {
    revise((current) => {
      const expeditions = { ...current.expeditions };
      if (!next || next.artifactIds.length === 0) delete expeditions[planet];
      else expeditions[planet] = next;
      return { ...current, expeditions };
    });
  };

  const discoverSite = () => {
    if (seeking) return;
    const choice = pickDiscovery(
      catalog.objects.map((object) => ({ id: object.id, planet: object.planet, missionId: object.missionId, hasImage: object.images.length > 0 })),
      planet,
      progress.records,
      selected?.id ?? null,
      seekTurn.current,
    );
    seekTurn.current += 1;
    if (!choice) {
      setArchiveFull(true);
      setPanel("log");
      return;
    }
    const object = catalog.objects.find((item) => item.id === choice);
    if (!object) return;
    setArchiveFull(false);
    setPanel(null);
    const go = () => {
      setSeeking(false);
      selectObject(object, false);
    };
    if (reduced) go();
    else {
      setSeeking(true);
      window.setTimeout(go, 700);
    }
  };

  const runScan = () => {
    setScanning(true);
    const ids = sitesFacing(
      catalog.objects.map((object) => ({
        id: object.id,
        planet: object.planet,
        latitude: object.location.latitude,
        longitude: object.location.longitude,
      })),
      planet,
      view.latitude,
      view.longitude,
      scanAngle(view.distance),
    );
    const finish = () => {
      setScanning(false);
      remember(ids);
      setScanIds(ids);
      setPanel("scan");
    };
    if (reduced) finish();
    else window.setTimeout(finish, 900);
  };

  const openRecorded = (id: string) => {
    const object = catalog.objects.find((item) => item.id === id);
    if (!object) return;
    setPanel(null);
    if (object.planet !== planet) {
      navigate(`/explore/${object.planet}?object=${object.id}`);
      return;
    }
    selectObject(object, false);
  };

  const toggleDrawer = (nextDrawer: "list" | "timeline") => {
    setDrawer((current) => (current === nextDrawer ? null : nextDrawer));
  };

  const named = (id: string) => catalog.objects.find((object) => object.id === id);
  const worlds = (["moon", "mars"] as const).map((world) => {
    const objects = catalog.objects.filter((object) => object.planet === world);
    const found = objects.filter((object) => progress.records[object.id]);
    return {
      planet: world,
      total: objects.length,
      found: found.length,
      explored: found.filter((object) => progress.records[object.id]?.exploredAt).length,
      missions: new Set(found.map((object) => object.missionId)).size,
      rovers: found.filter((object) => object.type === "rover").length,
    };
  });
  const logEntries = catalog.objects.flatMap((object) => {
    const record = progress.records[object.id];
    if (!record) return [];
    const mission = missionById(catalog.missions, object.missionId);
    return [{
      id: object.id,
      name: object.name[lang],
      planet: object.planet,
      type: object.type,
      typeLabel: t.typeLabels[object.type],
      mission: mission?.name[lang] ?? object.missionId,
      discoveredAt: record.discoveredAt,
      explored: Boolean(record.exploredAt),
    }];
  });
  const scanSites = (scanIds ?? []).flatMap((id) => {
    const object = named(id);
    return object ? [{ id, name: object.name[lang], missionId: object.missionId }] : [];
  });
  const scanMissions = [...new Set(scanSites.map((site) => site.missionId))];
  const repeatedMission = scanSites.length > 1 && scanMissions.length === 1 ? scanMissions[0] : null;
  const minimapMarks = catalog.objects.flatMap((object) => {
    if (object.planet !== planet) return [];
    const stops = expedition?.artifactIds ?? [];
    const stopIndex = stops.indexOf(object.id);
    const known = Boolean(progress.records[object.id]);
    if (!known && stopIndex < 0 && object.id !== selected?.id) return [];
    const role =
      object.id === selected?.id
        ? "selected"
        : expedition?.status === "active" && stopIndex === expedition.currentIndex
          ? "current"
          : stopIndex >= 0 && (expedition?.status === "completed" || (expedition?.status === "active" && stopIndex < (expedition?.currentIndex ?? 0)))
            ? "done"
            : stopIndex >= 0
              ? "planned"
              : "discovered";
    return [{ id: object.id, latitude: object.location.latitude, longitude: object.location.longitude, role }] as const;
  });
  const expeditionSites = (expedition?.artifactIds ?? []).flatMap((id) => {
    const object = named(id);
    return object ? [{ id, name: object.name[lang] }] : [];
  });
  const visitedObjects = (expedition?.artifactIds ?? []).flatMap((id) => {
    const object = named(id);
    return object ? [object] : [];
  });
  const spanYears = visitedObjects.flatMap((object) => {
    const mission = missionById(catalog.missions, object.missionId);
    return [yearOf(mission?.arrivalDate), yearOf(mission?.endDate)].filter((year): year is number => year !== null);
  });
  const expeditionSummary = expedition?.status === "completed"
    ? {
        visited: `${t.sitesVisited}: ${visitedObjects.length}`,
        missions: `${t.missionsEncountered}: ${new Set(visitedObjects.map((object) => object.missionId)).size}`,
        explored: `${t.artifactsExplored}: ${visitedObjects.filter((object) => progress.records[object.id]?.exploredAt).length}`,
        span: spanYears.length > 0 ? `${t.timelineSpan}: ${Math.min(...spanYears)}–${Math.max(...spanYears)}` : undefined,
      }
    : null;
  const panelClass = desktop
    ? "pointer-events-auto absolute top-36 left-3 z-30 max-h-[min(54dvh,520px)] w-[min(340px,calc(100%-1.5rem))] overflow-auto rounded-3xl border border-white/15 bg-[#070d1c]/88 p-4 shadow-2xl"
    : "pointer-events-auto absolute inset-x-3 top-16 bottom-3 z-40 overflow-auto rounded-3xl border border-white/15 bg-[#070d1c]/94 p-4";

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen();
  };

  return (
    <div className="relative h-dvh overflow-hidden">
      <div className="absolute inset-0">
        <PlanetViewport
          planet={planet}
          objects={markers}
          selectedId={selected?.id ?? null}
          focusNonce={focusNonce}
          siteFrame={desktop ? { right: -0.16, up: 0 } : { right: 0, up: 0.22 }}
          emphasisNonce={emphasisNonce}
          intro={false}
          autoRotate={autoRotate && !holdSpin}
          reducedMotion={reduced}
          errorMessage={t.sceneError}
          loadingLabel={t.loadingSurface}
          clusterHint={t.clusterChoose}
          labelFor={(object) => object.name[lang]}
          captionFor={(object) => {
            const year = yearOf(missionById(catalog.missions, object.missionId)?.arrivalDate);
            return {
              type: t.typeLabels[object.type],
              place: object.location.region ?? object.location.locationName,
              year: year ? year.toLocaleString(locale, { useGrouping: false }) : "",
            };
          }}
          discovery={discovery}
          discoveredIds={discovered}
          onDiscover={(ids) => {
            remember(ids);
            const found = catalog.objects.find((item) => item.id === ids[0]);
            if (!found) return;
            setNotice(found.name[lang]);
            if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
            noticeTimer.current = window.setTimeout(() => setNotice(null), 2200);
          }}
          onView={setView}
          missionIds={
            selected && missionMembers.some((object) => object.id === selected.id)
              ? [selected.id, ...missionMembers.filter((object) => object.id !== selected.id).map((object) => object.id)]
              : missionMembers.map((object) => object.id)
          }
          onFlight={setFlight}
          onSelect={(id) => {
            const object = catalog.objects.find((item) => item.id === id);
            if (object) selectObject(object, false);
          }}
          onEmptyClick={closeStory}
          sceneRef={sceneRef}
        />
      </div>
      <div
        className={`pointer-events-none absolute inset-x-0 top-16 bottom-0 z-10 bg-[radial-gradient(circle_at_center,transparent_16%,rgba(0,0,0,0.58)_78%)] transition-opacity duration-700 ${storyReady ? "opacity-100" : "opacity-0"}`}
      />
      <TopBar planet={planet} onPlanet={switchPlanet} dimmed={Boolean(selected)} onHelp={() => setHelpOpen(true)} onFullscreen={toggleFullscreen} />
      {!listVisible && (
        <div className="pointer-events-none absolute top-20 left-3 z-30 max-w-[14rem]">
          <p className="text-[10px] tracking-[0.18em] text-[#f2a64a] uppercase">{viewKicker}</p>
          <p className="text-sm text-[#f4f7ff]">{viewTitle}</p>
          <p className="text-xs text-[#93a6c9]">{viewNote}</p>
          {notice && (
            <div className="mt-3">
              <p className="text-[10px] tracking-[0.16em] text-[#6aa4ff] uppercase">{t.siteDetected}</p>
              <p className="text-sm text-[#f4f7ff]">{notice}</p>
            </div>
          )}
          <div className="pointer-events-auto mt-3 flex w-fit flex-col items-start gap-2">
            <IconTool label={t.exploreTools} pressed={toolsOpen} expanded={toolsOpen} onClick={() => setToolsOpen((value) => !value)}>
              {toolsOpen ? <LuX aria-hidden="true" /> : <LuMenu aria-hidden="true" />}
            </IconTool>
            <div inert={toolsOpen ? undefined : true} className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${toolsOpen ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"} ${reduced ? "transition-none" : ""}`}>
              <div className="flex flex-col gap-2 overflow-hidden">
                <IconTool label={seeking ? t.searchingArchive : selected ? t.discoverAnother : t.discoverSomething} onClick={discoverSite}>
                  <LuCompass aria-hidden="true" />
                </IconTool>
                <IconTool label={scanning ? t.scanningSurface : t.scanSurface} onClick={runScan}>
                  <LuScan aria-hidden="true" />
                </IconTool>
                <IconTool label={t.explorerLog} pressed={panel === "log"} onClick={() => setPanel((current) => (current === "log" ? null : "log"))}>
                  <LuBookOpen aria-hidden="true" />
                </IconTool>
                <IconTool label={t.myExpedition} pressed={panel === "expedition"} onClick={() => setPanel((current) => (current === "expedition" ? null : "expedition"))}>
                  <LuRoute aria-hidden="true" />
                </IconTool>
                <IconTool label={mapOpen ? t.hideMap : t.showMap} pressed={mapOpen} onClick={() => setMapOpen((value) => !value)}>
                  <LuMap aria-hidden="true" />
                </IconTool>
              </div>
            </div>
          </div>
          {mapOpen && (
            <div className="pointer-events-none mt-3">
              <Minimap
                planet={planet}
                latitude={view.latitude}
                longitude={view.longitude}
                hereLabel={t.youAreHere}
                label={`${t.minimapLabel}. ${viewTitle}.`}
                marks={minimapMarks}
              />
            </div>
          )}
        </div>
      )}
      {panel && (
        <div className={panelClass}>
          {archiveFull && panel === "log" && (
            <p className="mb-3 text-sm text-[#f4f7ff]">
              <span className="block text-[11px] tracking-[0.16em] text-[#f2a64a] uppercase">{t.allSitesKnown}</span>
              {t.allSitesKnownBody}
            </p>
          )}
          {panel === "log" && (
            <ExplorerLog
              title={t.explorerLog}
              entries={logEntries}
              worlds={worlds}
              emptyLabel={t.logEmpty}
              closeLabel={t.close}
              allLabel={t.categoryAll}
              planetLabels={{ moon: t.moon, mars: t.mars }}
              discoveredLabel={t.discoveredOn}
              exploredLabel={t.exploredWord}
              notExploredLabel={t.notYetExplored}
              progress={t.sitesProgress}
              missionsLabel={t.missionsProgress}
              exploredCountLabel={t.exploredProgress}
              roversLabel={t.roversProgress}
              lang={lang}
              onSelect={openRecorded}
              onClose={() => setPanel(null)}
            />
          )}
          {panel === "expedition" && (
            <ExpeditionPanel
              title={t.myExpedition}
              emptyLabel={t.noExpedition}
              closeLabel={t.close}
              startLabel={t.startExpedition}
              nextLabel={t.nextSite}
              completeLabel={t.expeditionComplete}
              newLabel={t.newExpedition}
              earlierLabel={t.moveEarlier}
              laterLabel={t.moveLater}
              removeLabel={t.removeFromExpedition}
              stepLabel={expedition ? fillCopy(t.expeditionStep, { index: expedition.currentIndex + 1, total: expedition.artifactIds.length }) : ""}
              sites={expeditionSites}
              expedition={expedition}
              summary={expeditionSummary}
              onOpen={openRecorded}
              onStart={() => {
                if (!expedition || expedition.artifactIds.length === 0) return;
                setTour(false);
                changeExpedition({ ...expedition, status: "active", currentIndex: 0 });
                const object = named(expedition.artifactIds[0]);
                if (object) selectObject(object, false);
              }}
              onNext={() => {
                if (!expedition || expedition.status !== "active") return;
                const index = expedition.currentIndex + 1;
                if (index >= expedition.artifactIds.length) {
                  changeExpedition({ ...expedition, status: "completed" });
                  return;
                }
                changeExpedition({ ...expedition, currentIndex: index });
                const object = named(expedition.artifactIds[index]);
                if (object) selectObject(object, false);
              }}
              onMove={(id, direction) => expedition && changeExpedition(moveExpeditionSite(expedition, id, direction))}
              onRemove={(id) => changeExpedition(toggleExpeditionSite(expedition ?? undefined, id))}
              onClear={() => changeExpedition(null)}
              onClose={() => setPanel(null)}
            />
          )}
          {panel === "scan" && (
            <ScanPanel
              title={t.scanResults}
              countLabel={scanSites.length > 0 ? fillCopy(t.sitesDetected, { count: scanSites.length }) : null}
              emptyLabel={t.noScanHits}
              closeLabel={t.close}
              missionLabel={repeatedMission ? t.showMissionLinks : null}
              sites={scanSites}
              onSelect={openRecorded}
              onMission={
                repeatedMission
                  ? () => {
                      const object = catalog.objects.find((item) => item.id === scanSites[0]?.id);
                      if (!object) return;
                      selectObject(object, false, repeatedMission);
                      setPanel(null);
                    }
                  : null
              }
              onClose={() => setPanel(null)}
            />
          )}
        </div>
      )}
      {scanning && <div className="scan-ring pointer-events-none absolute top-1/2 left-1/2 z-30 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#6aa4ff]/70" aria-hidden="true" />}
      {(seeking || (selected && flight !== "idle")) && (
        <p className="pointer-events-none absolute bottom-24 left-1/2 z-30 -translate-x-1/2 text-[11px] tracking-[0.22em] text-[#f2a64a] uppercase">
          {seeking ? t.searchingArchive : flight === "locating" ? t.locatingSite : t.targetAcquired}
        </p>
      )}
      <div className={`pointer-events-none absolute inset-x-0 top-16 bottom-0 z-20 transition-opacity duration-500 ${storyReady ? "opacity-60" : ""}`}>
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
          <div className={`pointer-events-auto absolute bottom-[4.75rem] left-3 flex flex-col gap-2 ${selected && desktop ? "right-[27rem]" : "right-3"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-pressed={drawer === "list"}
                  onClick={() => toggleDrawer("list")}
                  className={`rounded-full border px-3 py-2 text-sm ${drawer === "list" ? "border-[#6aa4ff] bg-[#6aa4ff]/15" : "border-white/15 bg-black/70"}`}
                >
                  {t.objects}
                </button>
                <button
                  type="button"
                  aria-pressed={tour}
                  onClick={toggleTour}
                  className={`rounded-full border px-3 py-2 text-sm ${tour ? "border-[#6aa4ff] bg-[#6aa4ff]/15 text-[#6aa4ff]" : "border-white/15 bg-black/70"}`}
                >
                  {tour ? t.stopTour : t.tour}
                </button>
                <button
                  type="button"
                  aria-pressed={discovery}
                  onClick={() => setDiscovery((value) => !value)}
                  className={`rounded-full border px-3 py-2 text-sm ${discovery ? "border-[#6aa4ff] bg-[#6aa4ff]/15 text-[#6aa4ff]" : "border-white/15 bg-black/70"}`}
                >
                  {discovery ? t.discovery : t.showAllSites}
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
          </div>
        )}
        {showDock && (
          <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-30">
            {timelineVisible && (
              <div className="mb-2">
                <TimelineBar events={events} activeId={selected?.id ?? null} onSelect={openEvent} />
              </div>
            )}
            <button
              type="button"
              aria-expanded={timelineVisible}
              aria-label={t.timeline}
              onClick={() => toggleDrawer("timeline")}
              className={`flex h-11 w-full shrink-0 items-center gap-3 rounded-full border px-5 text-xs tracking-[0.14em] whitespace-nowrap ${timelineVisible ? "border-[#f2a64a] bg-[#f2a64a]/15 text-[#f2a64a]" : "border-white/15 bg-[#070d1c]/75 text-[#f2a64a]"}`}
            >
              <span className="shrink-0">{yearMin}</span>
              <span className="h-px min-w-6 flex-1 bg-[#f2a64a]/70" />
              <span className="shrink-0 uppercase">{t.timeline}</span>
              <span className="h-px min-w-6 flex-1 bg-[#f2a64a]/70" />
              <span className="shrink-0">{yearMax}</span>
            </button>
          </div>
        )}
        {!desktop && selected && (
          <div className="pointer-events-auto absolute right-3 bottom-[calc(56dvh+0.75rem)] flex items-center gap-2">
            {tour && (
              <button
                type="button"
                onClick={toggleTour}
                className="rounded-full border border-[#6aa4ff] bg-[#6aa4ff]/15 px-3 py-2 text-sm text-[#6aa4ff]"
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
      {storyReady && selected && (
        <StoryPanel
          object={selected}
          missions={catalog.missions}
          sources={catalog.sources}
          mobile={!desktop}
          reducedMotion={reduced}
          onClose={closeStory}
          onPrevious={previous ? () => selectObject(previous, false) : null}
          onNext={next ? () => selectObject(next, false) : null}
          nearby={nearby}
          onNearby={(id) => {
            const object = catalog.objects.find((item) => item.id === id);
            if (object) selectObject(object, false);
          }}
          events={catalog.events}
          missionOpen={missionFocus === selected.missionId}
          siblings={catalog.objects
            .filter((object) => object.planet === selected.planet && object.missionId === selected.missionId)
            .map((object) => ({ id: object.id, name: object.name[lang] }))}
          hasTraverse={roverRoutes.some((route) => route.roverId === selected.id && route.points.length > 1)}
          onExploreMission={() => setSearchParams({ object: selected.id, mission: selected.missionId }, { replace: true })}
          onLeaveMission={() => setSearchParams({ object: selected.id }, { replace: true })}
          onEvent={(event) => {
            const object = catalog.objects.find((item) => item.id === event.objectId);
            if (object) selectObject(object, false);
          }}
          inExpedition={Boolean(expedition?.artifactIds.includes(selected.id))}
          onToggleExpedition={() => changeExpedition(toggleExpeditionSite(expedition ?? undefined, selected.id))}
        />
      )}
      <div className={`absolute inset-0 z-[70] bg-black transition-opacity duration-200 ${veil ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      {helpOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setHelpOpen(false)}>
          <div className="max-w-md rounded-3xl border border-white/10 bg-[#10182e] p-6" role="dialog" aria-labelledby="help-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="help-title" className="font-display text-3xl">
              {t.helpTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#c5d2ea]">{t.howToBody}</p>
            {reduced && <p className="mt-3 text-sm text-[#6aa4ff]">{t.reducedMotion}</p>}
            <button type="button" className="mt-5 rounded-full bg-[#3d7eff] px-4 py-2 text-sm text-[#f4f7ff]" onClick={() => setHelpOpen(false)}>
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function IconTool({
  label,
  onClick,
  pressed,
  expanded,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  expanded?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        aria-expanded={expanded}
        onClick={onClick}
        className={`grid h-10 w-10 place-items-center rounded-full border text-[15px] shadow-lg backdrop-blur-md transition duration-300 ${pressed ? "border-[#6aa4ff] bg-[#3d7eff] text-[#f4f7ff]" : "border-white/25 bg-[#070d1c]/80 text-[#f4f7ff] hover:border-[#6aa4ff] hover:bg-[#121a31]"}`}
      >
        {children}
      </button>
      <span role="tooltip" className="pointer-events-none absolute top-1/2 left-[calc(100%+0.55rem)] z-40 -translate-y-1/2 rounded-full border border-white/10 bg-[#070d1c]/95 px-2.5 py-1 text-[11px] whitespace-nowrap text-[#f4f7ff] opacity-0 shadow-lg transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
        {label}
      </span>
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
      className={`grid h-9 w-9 place-items-center text-sm ${pressed ? "text-[#6aa4ff]" : "text-[#f4f7ff]"}`}
    >
      {children}
    </button>
  );
}
