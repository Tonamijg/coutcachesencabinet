"use client";

export function NombreCell({
  valeur,
  onChange,
  label,
  step = 1,
  placeholder = "0",
  className = "w-24",
}: {
  valeur: number | null;
  onChange: (v: number | null) => void;
  label: string;
  step?: number;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min={0}
      step={step}
      aria-label={label}
      value={valeur ?? ""}
      placeholder={placeholder}
      onChange={(e) => {
        const brut = e.target.value;
        if (brut.trim() === "") return onChange(null);
        const nombre = Number(brut.replace(",", "."));
        onChange(Number.isNaN(nombre) ? null : Math.max(0, nombre));
      }}
      className={`${className} rounded border border-brand-200 px-2 py-1 text-right text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400`}
    />
  );
}
