import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { LuBookOpen, LuBox, LuCompass, LuEye, LuList, LuMenu, LuMinus, LuPlay, LuPlus, LuRefreshCw, LuRotateCcw, LuX } from "react-icons/lu";
import { ObjectList } from "../components/object/ObjectList";
import { ModelGallery } from "../components/object/ModelGallery";
import { StoryPanel } from "../components/object/StoryPanel";
import { PlanetViewport, webglAvailable, type SceneHandle } from "../components/planet/PlanetScene";
import { SearchBox } from "../components/search/SearchBox";
import { TimelineBar } from "../components/timeline/TimelineBar";
import { TopBar } from "../components/layout/TopBar";
import { ExplorerLog } from "../components/explore/ExplorerLog";
import { catalog } from "../data/catalog";
import { roverRoutes } from "../data/roverRoutes";
import { useI18n } from "../features/localization/LanguageContext";
import { fillCopy } from "../features/localization/strings";
import { useMinWidth, usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { usePageTitle } from "../hooks/usePageTitle";
import { useSound } from "../hooks/useSound";
import { soundscape } from "../lib/audio";
import { speakCatalogLine, stopNarration } from "../lib/narration";
import { transitionMs } from "../lib/transitions";
import { yearOf } from "../lib/coordinates/latLon";
import { formatDistanceKm, surfaceDistanceKm } from "../lib/coordinates/distance";
import {
  markDiscovered,
  markExplored,
  pickDiscovery,
  readExploration,
  writeExploration,
  type ExplorationSave,
  type FlightPhase,
  type SurfaceView,
} from "../lib/exploration";
import { catalogYearBounds, filterObjects, missionById } from "../lib/filtering";
import { artifactModels } from "../data/artifactModels";
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
  const phone = !useMinWidth(640);
  const sound = useSound();
  const sceneRef = useRef<SceneHandle | null>(null);
  const bounds = useMemo(() => catalogYearBounds(catalog.missions), []);
  const [filters, setFilters] = useState<Filters>({ types: [], statuses: [], missionId: null, throughYear: bounds.max });
  const [autoRotate, setAutoRotate] = useState(!reduced);
  const [drawer, setDrawer] = useState<"list" | "timeline" | null>(null);
  const [timelinePreview, setTimelinePreview] = useState<TimelineEvent | null>(null);
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
  const [panel, setPanel] = useState<null | "log">(null);
  const [narrationNote, setNarrationNote] = useState<string | null>(null);
  const [seeking, setSeeking] = useState(false);
  const [archiveFull, setArchiveFull] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [modelGalleryOpen, setModelGalleryOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [handoff, setHandoff] = useState<PlanetId | null>(null);
  const [live, setLive] = useState("");
  const [showOrient, setShowOrient] = useState(() => {
    try {
      return sessionStorage.getItem("abnf-orient") !== "hide";
    } catch {
      return false;
    }
  });
  const [promptDismissed, setPromptDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("abnf-explore-prompt") === "hide";
    } catch {
      return false;
    }
  });
  const [milestone, setMilestone] = useState<string | null>(null);
  const seekTurn = useRef(0);
  const noticeTimer = useRef<number | null>(null);
  const milestoneTimer = useRef<number | null>(null);
  const lastFoundCount = useRef<number | null>(null);
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

  useEffect(() => {
    if (sound.enabled) return;
    stopNarration();
    setNarrationNote(null);
  }, [sound.enabled]);

  useEffect(() => {
    soundscape.setPlanet(planet);
    setLive(fillCopy(t.planetReady, { planet: t[planet] }));
    return () => soundscape.setPlanet(null);
  }, [planet, t]);

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
    setNarrationNote(null);
    stopNarration();
    setArchiveFull(false);
    setView({ level: "global", distance: 2.8, inView: 0, latitude: 0, longitude: 0 });
  }, [planet]);

  useEffect(
    () => () => {
      veilTimers.current.forEach((timer) => window.clearTimeout(timer));
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
      if (milestoneTimer.current) window.clearTimeout(milestoneTimer.current);
    },
    [],
  );

  const layer = useRef({ help: false, drawer: null as "list" | "timeline" | null, tour: false, panel: null as typeof panel, focus: false });
  layer.current = { help: helpOpen, drawer, tour, panel, focus: focusMode };
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
        if (layer.current.focus) {
          setFocusMode(false);
          return;
        }
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
  useEffect(() => {
    if (!selected) return;
    setLive(fillCopy(t.artifactSelected, { name: selected.name[lang] }));
  }, [selected, lang, t]);
  const missionFocus = searchParams.get("mission");
  const missionMembers = missionFocus
    ? catalog.objects.filter((object) => object.planet === planet && object.missionId === missionFocus)
    : [];

  const exploreTitle = useMemo(() => {
    if (drawer === "timeline") {
      return "Timeline";
    }
    if (selected) {
      if (missionFocus === selected.missionId) {
        const mission = missionById(catalog.missions, selected.missionId);
        return mission ? mission.name[lang] : selected.name[lang];
      }
      return selected.name[lang];
    }
    return "Explore the Moon & Mars";
  }, [drawer, selected, missionFocus, lang]);

  usePageTitle(exploreTitle);
  const markers = [...filtered];
  for (const object of [selected, ...missionMembers]) {
    if (object && !markers.some((item) => item.id === object.id)) markers.push(object);
  }
  const planetTotal = catalog.objects.filter((object) => object.planet === planet).length;
  const events = catalog.events.filter((event) => catalog.objects.find((object) => object.id === event.objectId)?.planet === planet);

  const discovered = Object.keys(progress.records);
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
    soundscape.effect("flight");
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

  const narrateSite = (object: Artifact) => {
    if (!sound.enabled) {
      stopNarration();
      setNarrationNote(null);
      return;
    }
    const result = speakCatalogLine(object.summary[lang], lang, sound.volume);
    setNarrationNote(result === "no-voice" ? t.narrationMissing : null);
  };

  const selectObject = (object: Artifact, reveal = true, missionId?: string) => {
    setTour(false);
    applySelection(object, reveal, missionId);
    narrateSite(object);
  };

  const openEvent = (event: TimelineEvent) => {
    const object = catalog.objects.find((item) => item.id === event.objectId);
    if (!object) return;
    const year = Number(event.date.slice(0, 4));
    setFilters((current) => ({ ...current, throughYear: Math.max(current.throughYear, year) }));
    setEmphasisNonce((value) => value + 1);
    setTimelinePreview(null);
    selectObject(object);
  };

  const closeStory = () => {
    if (performance.now() < ignoreEmptyUntil.current) return;
    setTour(false);
    setFlight("idle");
    stopNarration();
    setNarrationNote(null);
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
      soundscape.effect("ui");
      setTour(false);
      return;
    }
    soundscape.effect("ui");
    setFilters({ types: [], statuses: [], missionId: null, throughYear: bounds.max });
    setDrawer(null);
    dismissExplorerPrompt();
    setTour(true);
  };

  const switchPlanet = (next: PlanetId) => {
    if (next === planet || veil) return;
    soundscape.effect("transition");
    if (reduced) {
      navigate(`/explore/${next}`);
      return;
    }
    setHandoff(next);
    setVeil(true);
    const fadeIn = window.setTimeout(() => {
      navigate(`/explore/${next}`);
      const fadeOut = window.setTimeout(() => {
        setVeil(false);
        setHandoff(null);
      }, transitionMs.planetReveal);
      veilTimers.current.push(fadeOut);
    }, transitionMs.planetHold);
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
  const foundHere = catalog.objects.filter((object) => object.planet === planet && progress.records[object.id]?.discoveredAt).length;
  const progressPercent = planetTotal === 0 ? 0 : Math.round((foundHere / planetTotal) * 100);
  const showExplorerPrompt = !promptDismissed && foundHere === 0 && !selected && !tour && !focusMode;

  useEffect(() => {
    const previous = lastFoundCount.current;
    lastFoundCount.current = foundHere;
    if (previous === null || foundHere <= previous) return;
    const halfway = Math.ceil(planetTotal / 2);
    const crossedHalf = previous < halfway && foundHere >= halfway;
    const message = foundHere === planetTotal
      ? t.discoveryMilestoneComplete
      : crossedHalf
        ? t.discoveryMilestoneHalf
        : previous === 0
          ? t.discoveryMilestoneFirst
          : null;
    if (!message) return;
    setMilestone(message);
    setLive(message);
    if (milestoneTimer.current) window.clearTimeout(milestoneTimer.current);
    milestoneTimer.current = window.setTimeout(() => setMilestone(null), 4200);
  }, [foundHere, planetTotal, t]);

  const dismissExplorerPrompt = () => {
    setPromptDismissed(true);
    try {
      sessionStorage.setItem("abnf-explore-prompt", "hide");
    } catch {
      /* The prompt can return on the next visit when storage is unavailable. */
    }
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
      soundscape.effect("ui");
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
      soundscape.effect("discover");
      selectObject(object, false);
    };
    if (reduced) go();
    else {
      setSeeking(true);
      window.setTimeout(go, 700);
    }
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
    soundscape.effect("ui");
    setDrawer((current) => {
      const next = current === nextDrawer ? null : nextDrawer;
      if (next !== "timeline") setTimelinePreview(null);
      return next;
    });
  };

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
          previewedId={timelinePreview?.objectId ?? null}
          focusNonce={focusNonce}
          siteFrame={{ right: 0, up: 0 }}
          guideSite={
            selected
              ? { latitude: selected.location.latitude, longitude: selected.location.longitude, attentive: true }
              : null
          }
          emphasisNonce={emphasisNonce}
          intro={false}
          autoRotate={autoRotate && !holdSpin}
          reducedMotion={reduced}
          errorMessage={t.sceneError}
          loadingLabel={t.loadingSurface}
          surfaceError={t.surfaceUnavailable}
          retryLabel={t.retry}
          clusterHint={t.clusterChoose}
          clickHint={t.clickToExplore}
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
      <TopBar
        planet={planet}
        onPlanet={switchPlanet}
        dimmed={Boolean(selected || listVisible || timelineVisible || panel || modelGalleryOpen || toolsOpen || helpOpen)}
        search={<SearchBox objects={catalog.objects} missions={catalog.missions} onSelect={(object) => selectObject(object)} />}
        onHelp={() => setHelpOpen(true)}
        onFullscreen={toggleFullscreen}
        focus={{ active: focusMode, onToggle: () => setFocusMode((value) => !value) }}
        sound={{ enabled: sound.enabled, failed: sound.failed, volume: sound.volume, onToggle: sound.toggle, onVolume: sound.setVolume }}
      />
      <div className="sr-only" role="status" aria-live="polite">{live}</div>
      {focusMode && selected && (
        <button type="button" className="absolute top-20 left-4 z-30 max-w-[16rem] truncate rounded-full border border-white/15 bg-[#070d1c]/80 px-4 py-2 text-left text-sm text-[#f4f7ff]" onClick={() => setFocusMode(false)}>
          {selected.name[lang]}
        </button>
      )}
      {!listVisible && !focusMode && showDock && (
        <div className="pointer-events-none absolute top-32 left-3 z-30 max-w-[calc(100%-1.5rem)] sm:top-20 sm:max-w-[14rem]">
          <p className="text-[10px] tracking-[0.18em] text-[#f2a64a] uppercase">{viewKicker}</p>
          <p className="text-sm text-[#f4f7ff]">{viewTitle}</p>
          <p className="text-xs text-[#93a6c9]">{viewNote}</p>
          <div className="pointer-events-none mt-2 max-w-[16rem]" role="progressbar" aria-label={t.sitesDiscovered} aria-valuemin={0} aria-valuemax={planetTotal} aria-valuenow={foundHere}>
            <div className="flex items-center justify-between text-[10px] text-[#c5d2ea]">
              <span>{t.sitesDiscovered}</span>
              <span className="text-[#f4f7ff]">{progressPercent}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#6aa4ff] transition-[width] duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          {phone && showOrient && (
            <p className="pointer-events-auto mt-2 flex items-center gap-2 text-[11px] text-[#c5d2ea]">
              {t.portraitHint}
              <button
                type="button"
                className="min-h-11 shrink-0 text-[#f4f7ff]"
                onClick={() => {
                  setShowOrient(false);
                  try {
                    sessionStorage.setItem("abnf-orient", "hide");
                  } catch {
                    /* The hint can stay dismissed for this visit. */
                  }
                }}
              >
                {t.dismiss}
              </button>
            </p>
          )}
          {notice && (
            <div className="mt-3">
              <p className="text-[10px] tracking-[0.16em] text-[#6aa4ff] uppercase">{t.siteDetected}</p>
              <p className="text-sm text-[#f4f7ff]">{notice}</p>
            </div>
          )}
          <div className="pointer-events-auto mt-3 flex w-fit flex-col items-start gap-2">
            <IconTool label={t.exploreTools} pressed={toolsOpen} expanded={toolsOpen} onClick={() => { soundscape.effect("ui"); setToolsOpen((value) => !value); }}>
              {toolsOpen ? <LuX aria-hidden="true" /> : <LuMenu aria-hidden="true" />}
            </IconTool>
            <div inert={toolsOpen ? undefined : true} className={`mt-2 flex flex-col gap-2 transition-[opacity,transform] duration-300 ease-out ${toolsOpen ? "opacity-100" : "pointer-events-none -translate-y-2 opacity-0"} ${reduced ? "transition-none" : ""}`}>
              <div className="flex flex-col gap-2">
                <IconTool label={t.objects} onClick={() => toggleDrawer("list")}>
                  <LuList aria-hidden="true" />
                </IconTool>
                <IconTool label={tour ? t.stopTour : t.tour} pressed={tour} onClick={toggleTour}>
                  <LuPlay aria-hidden="true" />
                </IconTool>
                <IconTool label={discovery ? t.discovery : t.showAllSites} pressed={discovery} onClick={() => { soundscape.effect("ui"); setDiscovery((value) => !value); }}>
                  <LuEye aria-hidden="true" />
                </IconTool>
                <IconTool label={seeking ? t.searchingArchive : selected ? t.discoverAnother : t.discoverSomething} onClick={discoverSite}>
                  <LuCompass aria-hidden="true" />
                </IconTool>
                <IconTool label={t.explorerLog} pressed={panel === "log"} onClick={() => { soundscape.effect("ui"); setPanel((current) => (current === "log" ? null : "log")); }}>
                  <LuBookOpen aria-hidden="true" />
                </IconTool>
                <IconTool label={t.modelGallery} pressed={modelGalleryOpen} onClick={() => { soundscape.effect("ui"); setModelGalleryOpen(true); }}>
                  <LuBox aria-hidden="true" />
                </IconTool>
              </div>
            </div>
          </div>
        </div>
      )}
      {showExplorerPrompt && (
        <aside className="absolute right-3 bottom-20 z-30 w-[min(19rem,calc(100%-1.5rem))] rounded-3xl border border-[#6aa4ff]/45 bg-[#070d1c]/92 p-4 shadow-2xl backdrop-blur-md" aria-labelledby="explore-prompt-title">
          <p id="explore-prompt-title" className="text-[11px] tracking-[0.16em] text-[#f2a64a] uppercase">{t.discoveryPromptTitle}</p>
          <p className="mt-2 text-sm leading-5 text-[#f4f7ff]">{t.discoveryPromptBody}</p>
          <div className="mt-3 flex items-center gap-3">
            <button type="button" className="min-h-11 rounded-full bg-[#3d7eff] px-4 text-sm text-[#f4f7ff]" onClick={toggleTour}>
              {t.discoveryPromptTour}
            </button>
            <button type="button" className="min-h-11 text-sm text-[#c5d2ea]" onClick={dismissExplorerPrompt}>
              {t.dismiss}
            </button>
          </div>
        </aside>
      )}
      {milestone && (
        <p className="pointer-events-none absolute bottom-24 left-1/2 z-40 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full border border-[#f2a64a]/45 bg-[#070d1c]/92 px-4 py-2 text-center text-xs text-[#f4f7ff] shadow-xl" role="status">
          {milestone}
        </p>
      )}
      {panel && !focusMode && (
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
        </div>
      )}
      {modelGalleryOpen && !focusMode && <ModelGallery models={artifactModels} onClose={() => setModelGalleryOpen(false)} />}
      {(seeking || (selected && flight !== "idle")) && (
        <p className="pointer-events-none absolute bottom-24 left-1/2 z-30 -translate-x-1/2 text-[11px] tracking-[0.22em] text-[#f2a64a] uppercase">
          {seeking ? t.searchingArchive : flight === "locating" ? t.locatingSite : t.targetAcquired}
        </p>
      )}
      <div inert={focusMode ? true : undefined} className={`pointer-events-none absolute inset-x-0 top-16 bottom-0 z-20 transition-opacity duration-500 ${focusMode ? "opacity-0" : storyReady ? "opacity-60" : ""}`}>
        <div
          inert={listVisible ? undefined : true}
          className={`pointer-events-auto absolute bottom-36 left-3 flex transition duration-500 ${desktop ? "top-16 w-[min(340px,calc(100%-1.5rem))]" : "top-14 w-[calc(100%-1.5rem)]"} ${listVisible ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-[120%] opacity-0"
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
            onClose={() => setDrawer(null)}
            onSelect={(id) => {
              const object = catalog.objects.find((item) => item.id === id);
              if (object) selectObject(object, false);
            }}
          />
        </div>
        {webgl && showDock && (
          <div className={`pointer-events-auto absolute left-3 z-30 ${desktop ? "bottom-19" : selected ? "bottom-[calc(78dvh+1rem)]" : "bottom-19"}`}>
            <CameraCluster
              zoomInLabel={t.zoomIn}
              zoomOutLabel={t.zoomOut}
              resetLabel={t.resetView}
              spinLabel={t.autoRotate}
              spinning={autoRotate}
              onZoomIn={() => { soundscape.effect("zoom"); sceneRef.current?.zoomIn(); }}
              onZoomOut={() => { soundscape.effect("zoom"); sceneRef.current?.zoomOut(); }}
              onReset={() => {
                soundscape.effect("reset");
                if (selectedIdRef.current) closeStory();
                else sceneRef.current?.reset();
              }}
              onSpin={() => { soundscape.effect("rotate"); setAutoRotate((value) => !value); }}
            />
          </div>
        )}
        {showDock && (
          <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-30">
            {timelineVisible && (
              <div className="mb-2">
                <TimelineBar planet={planet} events={events} activeId={selected?.id ?? null} onSelect={openEvent} onPreview={setTimelinePreview} />
              </div>
            )}
            <button
              type="button"
              aria-expanded={timelineVisible}
              aria-label={t.timeline}
              onClick={() => toggleDrawer("timeline")}
              className={`group relative flex h-12 w-full shrink-0 items-center gap-3 overflow-hidden rounded-full border px-5 text-xs tracking-[0.14em] whitespace-nowrap shadow-lg transition duration-300 hover:-translate-y-0.5 hover:border-[#f2a64a]/75 focus-visible:-translate-y-0.5 ${timelineVisible ? "border-[#f2a64a] bg-[#f2a64a]/18 text-[#f2a64a] shadow-[0_0_28px_rgba(242,166,74,0.18)]" : "border-white/15 bg-[#070d1c]/80 text-[#f2a64a]"}`}
            >
              <span className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(242,166,74,0.18),transparent_65%)] transition-opacity ${timelineVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
              <span className="relative shrink-0 text-[11px] text-[#f2a64a]">{yearMin}</span>
              <span className="relative h-px min-w-5 flex-1 bg-gradient-to-r from-[#f2a64a]/70 via-[#f2a64a] to-[#6aa4ff]/50" />
              <span className="relative shrink-0 font-medium uppercase">{t.timeline}</span>
              <span className="relative h-px min-w-5 flex-1 bg-gradient-to-r from-[#6aa4ff]/50 via-[#f2a64a] to-[#f2a64a]/70" />
              <span className="relative shrink-0 text-[11px] text-[#f2a64a]">{yearMax}</span>
            </button>
          </div>
        )}
      </div>
      {storyReady && selected && !focusMode && (
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
          onHear={() => narrateSite(selected)}
          narrationNote={narrationNote}
          onOpen3D={() => {
            soundscape.effect("ui");
            setModelGalleryOpen(true);
          }}
        />
      )}
      <div role="status" className={`absolute inset-0 z-[70] grid place-items-center bg-[#070d1c] transition-opacity duration-300 ${veil ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        {veil && handoff && (
          <div className="px-6 text-center">
            <p className="text-[11px] tracking-[0.22em] text-[#f2a64a] uppercase">{fillCopy(t.preparingPlanet, { planet: t[handoff] })}</p>
            <p className="mt-3 text-sm text-[#f4f7ff]">{t.loadingSurface}</p>
          </div>
        )}
      </div>
      {sound.failed && <p className="pointer-events-none absolute top-16 right-4 z-30 max-w-xs text-xs text-[#c5d2ea]">{t.audioUnavailable}</p>}
      {helpOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setHelpOpen(false)}>
          <div className="max-w-md rounded-3xl border border-white/10 bg-[#10182e] p-6" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="help-title" className="font-display text-3xl">
              {t.helpTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#c5d2ea]">{t.howToBody}</p>
            <p className="mt-3 text-sm leading-6 text-[#c5d2ea]">{t.focusHelp}</p>
            <p className="mt-3 text-sm leading-6 text-[#93a6c9]">{t.ambientNote}</p>
            {reduced && <p className="mt-3 text-sm text-[#6aa4ff]">{t.reducedMotion}</p>}
            <button type="button" autoFocus className="mt-5 min-h-11 rounded-full bg-[#3d7eff] px-4 py-2 text-sm text-[#f4f7ff]" onClick={() => setHelpOpen(false)}>
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
        className={`grid h-11 w-11 place-items-center rounded-full border text-[15px] shadow-lg backdrop-blur-md transition duration-300 ${pressed ? "border-[#6aa4ff] bg-[#3d7eff] text-[#f4f7ff]" : "border-white/25 bg-[#070d1c]/80 text-[#f4f7ff] hover:border-[#6aa4ff] hover:bg-[#121a31]"}`}
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
    <div className="flex shrink-0 items-center gap-0.5 rounded-2xl border border-white/15 bg-[#070d1c]/90 p-1 shadow-xl backdrop-blur-md">
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
        <LuRefreshCw className={spinning ? "transition-transform duration-500" : "opacity-60"} />
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
    <span className="group relative block">
      <button
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        onClick={onClick}
        className={`grid h-10 w-10 place-items-center rounded-xl text-sm transition hover:bg-white/10 ${pressed ? "bg-[#6aa4ff]/15 text-[#6aa4ff]" : "text-[#f4f7ff]"}`}
      >
        {children}
      </button>
      <span role="tooltip" className="pointer-events-none absolute top-1/2 left-[calc(100%+0.55rem)] z-40 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#070d1c]/95 px-2.5 py-1 text-[11px] text-[#f4f7ff] opacity-0 shadow-lg transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
        {label}
      </span>
    </span>
  );
}
