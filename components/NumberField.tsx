"use client";

import { useId, useState } from "react";

interface NumberFieldProps {
  label: string;
  unite?: string;
  aide?: string;
  valeur: number | null;
  onChange: (valeur: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  allowNegative?: boolean;
  required?: boolean;
}

export function NumberField({
  label,
  unite,
  aide,
  valeur,
  onChange,
  placeholder,
  min,
  max,
  step = 1,
  allowNegative = false,
  required = false,
}: NumberFieldProps) {
  const id = useId();
  const [erreur, setErreur] = useState<string | null>(null);
  const seuilMin = min ?? (allowNegative ? undefined : 0);

  function gerer(brut: string) {
    if (brut.trim() === "") {
      setErreur(null);
      onChange(null);
      return;
    }
    const nombre = Number(brut.replace(",", "."));
    if (Number.isNaN(nombre)) {
      setErreur("Valeur numérique attendue.");
      return;
    }
    if (seuilMin !== undefined && nombre < seuilMin) {
      setErreur("Les valeurs négatives ne sont pas autorisées ici.");
      onChange(nombre);
      return;
    }
    if (max !== undefined && nombre > max) {
      setErreur(`La valeur ne peut pas dépasser ${max}.`);
      onChange(nombre);
      return;
    }
    setErreur(null);
    onChange(nombre);
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-brand-800">
        {label}
        {required && <span className="text-brand-500"> *</span>}
      </label>
      <div className="mt-1 flex items-stretch">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          min={seuilMin}
          max={max}
          value={valeur ?? ""}
          placeholder={placeholder}
          onChange={(e) => gerer(e.target.value)}
          aria-invalid={erreur ? "true" : "false"}
          aria-describedby={aide ? `${id}-aide` : undefined}
          className={`w-full rounded-md border px-3 py-2 text-sm text-brand-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400 ${
            erreur ? "border-red-400" : "border-brand-200"
          }`}
        />
        {unite && (
          <span className="ml-2 flex items-center whitespace-nowrap text-sm text-brand-500">
            {unite}
          </span>
        )}
      </div>
      {aide && !erreur && (
        <p id={`${id}-aide`} className="mt-1 text-xs text-brand-500">
          {aide}
        </p>
      )}
      {erreur && <p className="mt-1 text-xs font-medium text-red-600">{erreur}</p>}
    </div>
  );
}
