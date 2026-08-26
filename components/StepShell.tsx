"use client";

import Link from "next/link";
import { ProgressBar } from "./ProgressBar";
import { useEvaluation } from "@/context/EvaluationContext";
import { ETAPES, identificationComplete } from "@/lib/types";

interface StepShellProps {
  etape: number;
  titre: string;
  /** Un ou deux phrases : ce que contient l'étape et pourquoi elle existe dans le parcours. */
  objet: string;
  children: React.ReactNode;
  precedent?: { href: string; label?: string };
  suivant?: { href: string; label?: string; disabled?: boolean; onClick?: () => void };
}

export function StepShell({ etape, titre, objet, children, precedent, suivant }: StepShellProps) {
  const { etat, pret } = useEvaluation();
  const identifie = pret && identificationComplete(etat.identification);

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <ProgressBar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-500">
              Étape {etape} sur {ETAPES.length - 1}
            </p>
            {identifie && (
              <p className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">
                {etat.identification.cabinet} · {etat.identification.nomUtilisateur}
              </p>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-brand-900 sm:text-3xl">{titre}</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-brand-700">{objet}</p>
        </header>

        <div className="space-y-8">{children}</div>

        <footer className="mt-10 flex items-center justify-between border-t border-brand-100 pt-6">
          {precedent ? (
            <Link
              href={precedent.href}
              className="inline-flex items-center gap-2 rounded-md border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
            >
              ← {precedent.label ?? "Étape précédente"}
            </Link>
          ) : (
            <span />
          )}
          {suivant &&
            (suivant.disabled ? (
              <button
                type="button"
                disabled
                title="Complétez les champs requis pour continuer"
                className="cursor-not-allowed rounded-md bg-brand-100 px-5 py-2 text-sm font-semibold text-brand-400"
              >
                {suivant.label ?? "Étape suivante"} →
              </button>
            ) : (
              <Link
                href={suivant.href}
                onClick={suivant.onClick}
                className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                {suivant.label ?? "Étape suivante"} →
              </Link>
            ))}
        </footer>
      </main>
    </div>
  );
}
