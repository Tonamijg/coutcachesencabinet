type Variante = "info" | "avertissement" | "pivot";

const STYLES: Record<Variante, string> = {
  info: "border-brand-200 bg-brand-50 text-brand-800",
  avertissement: "border-amber-300 bg-amber-50 text-amber-900",
  pivot: "border-brand-400 bg-white text-brand-900 ring-1 ring-brand-200",
};

const ICONES: Record<Variante, string> = {
  info: "ℹ️",
  avertissement: "⚠️",
  pivot: "🎯",
};

export function Callout({
  variante = "info",
  titre,
  children,
}: {
  variante?: Variante;
  titre?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border p-4 text-sm leading-relaxed ${STYLES[variante]}`}>
      <div className="flex gap-3">
        <span aria-hidden className="text-lg leading-none">
          {ICONES[variante]}
        </span>
        <div>
          {titre && <p className="mb-1 font-semibold">{titre}</p>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
