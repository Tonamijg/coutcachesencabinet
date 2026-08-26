import { EvaluationState } from "./types";

const CLE_STOCKAGE = "couts-caches-evaluation-v1";

export function chargerEtat(): EvaluationState | null {
  if (typeof window === "undefined") return null;
  try {
    const brut = window.localStorage.getItem(CLE_STOCKAGE);
    if (!brut) return null;
    const parsed = JSON.parse(brut);
    if (parsed && parsed.version === 1) return parsed as EvaluationState;
    return null;
  } catch {
    return null;
  }
}

export function sauvegarderEtat(etat: EvaluationState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat));
  } catch {
    // Stockage indisponible (navigation privée, quota atteint...) : la saisie
    // reste utilisable en mémoire pour la session en cours.
  }
}

export function effacerEtat(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CLE_STOCKAGE);
  } catch {
    // ignoré
  }
}
