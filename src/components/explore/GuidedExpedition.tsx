import { formatCoordinate } from "../../lib/coordinates/latLon";
import { useI18n } from "../../features/localization/LanguageContext";
import { fillCopy } from "../../features/localization/strings";
import type { Artifact, Mission } from "../../types/catalog";

type Props = {
  missions: Mission[];
  active: Mission | null;
  sites: Artifact[];
  opened: number;
  next: Artifact | null;
  onChoose: (missionId: string | null) => void;
  onTravel: (site: Artifact) => void;
  onClose: () => void;
};

export function GuidedExpedition({ missions, active, sites, opened, next, onChoose, onTravel, onClose }: Props) {
  const { t, lang } = useI18n();
  const done = active !== null && sites.length > 0 && opened >= sites.length;

  return (
    <div className="text-sm text-[#f4f7ff]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.18em] text-[#f2a64a] uppercase">{t.guideName}</p>
          <h2 className="font-display text-2xl leading-tight">{t.guidedExpedition}</h2>
        </div>
        <button type="button" autoFocus onClick={onClose} className="min-h-11 rounded-full border border-white/15 px-3 text-xs">
          {t.close}
        </button>
      </div>
      <p className="mt-2 text-xs leading-5 text-[#93a6c9]">{t.guideRole}</p>

      {!active && (
        <ul className="mt-4 space-y-2">
          {missions.map((mission, index) => (
            <li key={mission.id}>
              <button type="button" onClick={() => onChoose(mission.id)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-left hover:border-[#6aa4ff]/50">
                <span className="block text-[10px] tracking-[0.14em] text-[#93a6c9] uppercase">{index === 0 ? t.suggestedNext : mission.agency}</span>
                <span className="block text-base">{mission.name[lang]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {active && (
        <div className="mt-4 space-y-3">
          <p className="text-[10px] tracking-[0.16em] text-[#6aa4ff] uppercase">{t.missionBrief}</p>
          <h3 className="font-display text-xl">{active.name[lang]}</h3>
          <p className="leading-6 text-[#c5d2ea]">{active.description[lang]}</p>
          <p className="leading-6">{active.objectives[lang]}</p>
          <p className="text-xs text-[#93a6c9]">{fillCopy(t.missionSitesProgress, { done: opened, total: sites.length })}</p>
          {next && (
            <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3">
              <p className="text-[10px] tracking-[0.14em] text-[#f2a64a] uppercase">{t.location}</p>
              <p className="mt-1">{next.name[lang]}</p>
              <p className="mt-1 text-xs text-[#93a6c9]">{formatCoordinate(next.location.latitude, next.location.longitude)}</p>
              <p className="mt-2 text-xs leading-5">{next.summary[lang]}</p>
              <button type="button" onClick={() => onTravel(next)} className="mt-3 min-h-11 rounded-full bg-[#3d7eff] px-4 text-sm">
                {t.travelToSite}
              </button>
            </div>
          )}
          {done && <p className="rounded-2xl border border-[#f2a64a]/40 bg-[#f2a64a]/10 px-3 py-3 text-sm">{t.missionRecorded}</p>}
          <button type="button" onClick={() => onChoose(null)} className="text-xs text-[#93a6c9] underline-offset-2 hover:underline">
            {t.chooseMission}
          </button>
        </div>
      )}
    </div>
  );
}
