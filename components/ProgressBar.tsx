"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ETAPES } from "@/lib/types";

export function ProgressBar() {
  const pathname = usePathname();
  const indexActuel = Math.max(
    0,
    ETAPES.findIndex((e) => e.chemin === pathname)
  );

  return (
    <nav aria-label="Progression du parcours" className="border-b border-brand-100 bg-white">
      <ol className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-3 sm:gap-2 sm:px-6">
        {ETAPES.map((etape, index) => {
          const estActuelle = index === indexActuel;
          const estFaite = index < indexActuel;
          const franchissable = index <= indexActuel;
          return (
            <li key={etape.chemin} className="flex flex-1 items-center gap-1 sm:gap-2">
              {franchissable ? (
                <Link
                  href={etape.chemin}
                  className="group flex flex-1 items-center gap-2"
                  aria-current={estActuelle ? "step" : undefined}
                >
                  <StepDot numero={index} estActuelle={estActuelle} estFaite={estFaite} />
                  <span
                    className={`hidden truncate text-sm sm:inline ${
                      estActuelle ? "font-semibold text-brand-800" : "text-brand-500"
                    }`}
                  >
                    {etape.titre}
                  </span>
                </Link>
              ) : (
                <div className="flex flex-1 items-center gap-2 opacity-50">
                  <StepDot numero={index} estActuelle={false} estFaite={false} />
                  <span className="hidden truncate text-sm text-brand-500 sm:inline">
                    {etape.titre}
                  </span>
                </div>
              )}
              {index < ETAPES.length - 1 && (
                <div
                  className={`h-0.5 flex-1 rounded ${
                    index < indexActuel ? "bg-brand-500" : "bg-brand-100"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepDot({
  numero,
  estActuelle,
  estFaite,
}: {
  numero: number;
  estActuelle: boolean;
  estFaite: boolean;
}) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
        estActuelle
          ? "bg-brand-600 text-white ring-2 ring-brand-200"
          : estFaite
            ? "bg-brand-500 text-white"
            : "bg-brand-50 text-brand-500"
      }`}
    >
      {estFaite ? "✓" : numero}
    </span>
  );
}
