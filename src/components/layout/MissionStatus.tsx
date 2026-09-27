type Line = { label: string; value: string };

export function MissionStatus({ kicker, lines }: { kicker: string; lines: Line[] }) {
  return (
    <section className="pointer-events-none mt-3 max-w-[16rem] rounded-2xl border border-white/10 bg-[#070d1c]/72 px-3 py-2 backdrop-blur-sm" aria-label={kicker}>
      <p className="text-[10px] tracking-[0.18em] text-[#f2a64a] uppercase">{kicker}</p>
      <dl className="mt-1 space-y-0.5 text-[11px]">
        {lines.map((line) => (
          <div key={line.label} className="flex gap-3">
            <dt className="shrink-0 text-[#93a6c9]">{line.label}</dt>
            <dd className="truncate text-[#f4f7ff]">{line.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
