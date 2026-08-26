"use client";

export function HeureCell({
  valeur,
  onChange,
  label,
}: {
  valeur: number | null;
  onChange: (v: number | null) => void;
  label: string;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min={0}
      step={0.25}
      aria-label={label}
      value={valeur ?? ""}
      placeholder="0"
      onChange={(e) => {
        const brut = e.target.value;
        if (brut.trim() === "") return onChange(null);
        const nombre = Number(brut.replace(",", "."));
        onChange(Number.isNaN(nombre) ? null : Math.max(0, nombre));
      }}
      className="w-16 rounded border border-brand-200 px-1.5 py-1 text-center text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
    />
  );
}
