import { platformHighlights } from "@/lib/mock-data";

function LiveIndicator() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
    </span>
  );
}

export default function PlatformStatsTicker() {
  return (
    <section className="relative border-y border-border bg-surface-raised/70 py-5 backdrop-blur">
      <div className="hide-scrollbar overflow-hidden">
        <div className="flex w-max animate-marquee gap-14 px-6 font-display text-lg font-semibold text-text/85">
          {[...platformHighlights, ...platformHighlights, ...platformHighlights].map((h, i) => (
            <span key={i} className="inline-flex items-center gap-2.5">
              <span className="text-gradient-brand text-2xl">
                {h.value.toLocaleString()}
                {h.suffix}
              </span>
              <span className="text-sm font-medium text-text-secondary">{h.label}</span>
              <span className="text-text-tertiary">
                <LiveIndicator />
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
