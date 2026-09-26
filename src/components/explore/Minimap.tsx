import { latLonToVector } from "../../lib/coordinates/latLon";
import type { PlanetId } from "../../types/catalog";

type Mark = {
  id: string;
  latitude: number;
  longitude: number;
  role: "selected" | "current" | "planned" | "done" | "discovered";
};

export function Minimap({
  planet,
  latitude,
  longitude,
  marks,
  label,
  hereLabel,
}: {
  planet: PlanetId;
  latitude: number;
  longitude: number;
  marks: Mark[];
  label: string;
  hereLabel: string;
}) {
  const frame = basis(latitude, longitude);
  const plotted = marks.flatMap((mark) => {
    const point = project(mark.latitude, mark.longitude, frame);
    return point ? [{ ...mark, ...point }] : [];
  });
  const tone = planet === "mars" ? "#8a4b32" : "#8d93a3";

  return (
    <div className="w-28 rounded-2xl border border-white/15 bg-[#070d1c]/80 p-2" role="img" aria-label={label}>
      <svg viewBox="-1.15 -1.15 2.3 2.3" className="h-24 w-full">
        <circle r="1" fill={tone} fillOpacity="0.35" stroke="rgba(244,247,255,0.35)" strokeWidth="0.03" />
        {plotted.map((mark) => (
          <MarkShape key={mark.id} x={mark.x} y={-mark.y} role={mark.role} />
        ))}
        <polygon points="0,-0.14 0.1,0.1 -0.1,0.1" fill="#f2a64a" />
      </svg>
      <p className="text-center text-[10px] tracking-[0.14em] text-[#93a6c9] uppercase">{hereLabel}</p>
    </div>
  );
}

function MarkShape({ x, y, role }: { x: number; y: number; role: Mark["role"] }) {
  if (role === "selected" || role === "current") return <circle cx={x} cy={y} r="0.07" fill="#6aa4ff" />;
  if (role === "planned") return <circle cx={x} cy={y} r="0.065" fill="none" stroke="#f4f7ff" strokeWidth="0.03" />;
  if (role === "done") return <rect x={x - 0.05} y={y - 0.05} width="0.1" height="0.1" fill="#c5d2ea" />;
  return <circle cx={x} cy={y} r="0.035" fill="#f4f7ff" />;
}

function basis(latitude: number, longitude: number) {
  const n = latLonToVector(latitude, longitude, 1);
  const up = Math.abs(n.y) > 0.92 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
  const along = up.x * n.x + up.y * n.y + up.z * n.z;
  const raw = { x: up.x - n.x * along, y: up.y - n.y * along, z: up.z - n.z * along };
  const length = Math.hypot(raw.x, raw.y, raw.z) || 1;
  const north = { x: raw.x / length, y: raw.y / length, z: raw.z / length };
  const east = {
    x: north.y * n.z - north.z * n.y,
    y: north.z * n.x - north.x * n.z,
    z: north.x * n.y - north.y * n.x,
  };
  return { n, north, east };
}

function project(latitude: number, longitude: number, frame: ReturnType<typeof basis>) {
  const site = latLonToVector(latitude, longitude, 1);
  const depth = site.x * frame.n.x + site.y * frame.n.y + site.z * frame.n.z;
  if (depth <= 0.08) return null;
  const x = site.x * frame.east.x + site.y * frame.east.y + site.z * frame.east.z;
  const y = site.x * frame.north.x + site.y * frame.north.y + site.z * frame.north.z;
  const scale = 0.92 / Math.max(0.2, depth);
  return { x: Math.max(-0.92, Math.min(0.92, x * scale)), y: Math.max(-0.92, Math.min(0.92, y * scale)) };
}
