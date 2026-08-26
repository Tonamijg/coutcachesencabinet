// Lecture qualitative et pistes d'action : des phrases générées à partir des
// valeurs réellement saisies (pas de texte figé), pour aider l'utilisateur à
// interpréter le résultat sans avoir à le déduire lui-même des pourcentages.

import { LecturesDerivees, LigneSynthese, Synthese } from "./calculations";
import { formatNombre2, formatPourcentage } from "./format";

export function genererLectureQualitative(synthese: Synthese, lectures: LecturesDerivees): string[] {
  if (synthese.total <= 0) {
    return [
      "Aucun montant significatif n'a encore été saisi : complétez le relevé de temps et les dysfonctionnements pour obtenir une lecture qualitative du résultat.",
    ];
  }

  const phrases: string[] = [];

  const composantsPositifs = synthese.composants.filter((c) => c.montant > 0);
  const dominant = composantsPositifs.reduce<LigneSynthese | null>(
    (max, c) => (!max || c.montant > max.montant ? c : max),
    null
  );
  if (dominant) {
    if (dominant.part >= 0.3) {
      phrases.push(
        `Le poste « ${dominant.nom} » concentre à lui seul ${formatPourcentage(dominant.part)} du coût caché total : c'est le levier prioritaire pour réduire ce coût.`
      );
    } else {
      phrases.push(
        `Le poste le plus significatif est « ${dominant.nom} », avec ${formatPourcentage(dominant.part)} du total — le résultat reste toutefois réparti entre plusieurs composants, sans poste franchement dominant.`
      );
    }
  }

  if (lectures.partCoutOpportunite >= 0.5) {
    phrases.push(
      `La majorité du coût caché (${formatPourcentage(lectures.partCoutOpportunite)}) correspond à du temps non valorisé plutôt qu'à des dépenses décaissées : il n'apparaît dans aucun compte, mais mobilise réellement vos équipes.`
    );
  } else if (lectures.partDecaissementReel >= 0.5) {
    phrases.push(
      `La majorité du coût caché (${formatPourcentage(lectures.partDecaissementReel)}) correspond ici à des dépenses réellement décaissées : c'est la part la plus directement visible dans vos comptes.`
    );
  }

  if (lectures.equivalentTempsPlein >= 1) {
    phrases.push(
      `Le temps consacré à la relance et à la reprise équivaut à ${formatNombre2(lectures.equivalentTempsPlein)} ETP mobilisé en continu sur l'année — l'équivalent d'un poste à temps plein ou plus, dédié uniquement à compenser les retards.`
    );
  } else if (lectures.equivalentTempsPlein >= 0.5) {
    phrases.push(
      `Le temps consacré à la relance et à la reprise équivaut à ${formatNombre2(lectures.equivalentTempsPlein)} ETP — l'équivalent d'un mi-temps ou plus mobilisé en continu sur l'année.`
    );
  }

  const nonCreationPotentiel = synthese.composants.find((c) => c.cle === "nonCreationPotentiel");
  const risques = synthese.composants.find((c) => c.cle === "risques");
  const composantsNonEvalues = [nonCreationPotentiel, risques].filter((c) => c && c.montant === 0);
  if (composantsNonEvalues.length > 0) {
    const noms = composantsNonEvalues.map((c) => `« ${c!.nom} »`).join(" et ");
    phrases.push(
      `Le${composantsNonEvalues.length > 1 ? "s composants" : " composant"} ${noms} ${composantsNonEvalues.length > 1 ? "sont" : "est"} resté${composantsNonEvalues.length > 1 ? "s" : ""} à zéro : si ce n'est pas volontaire, le montant total est probablement sous-estimé.`
    );
  }

  return phrases;
}

export interface PisteAction {
  cle: string;
  nom: string;
  montant: number;
  suggestions: string[];
}

const PISTES_PAR_COMPOSANT: Record<string, string[]> = {
  sursalaire: [
    "Resserrer le calendrier de relance pour limiter le recours aux heures supplémentaires en fin de période.",
    "Fixer un seuil clair avant de mobiliser un chef de mission sur des travaux de collaborateur, pour n'y recourir qu'en dernier ressort.",
  ],
  surtemps: [
    "Mettre en place une relance automatique des pièces manquantes dès le début de la mission plutôt qu'à l'approche de l'échéance.",
    "Identifier les dossiers structurellement en retard pour leur proposer un accompagnement ou une tarification adaptée.",
  ],
  surconsommation: [
    "Dématérialiser la collecte des pièces (portail client, application dédiée) pour réduire déplacements et envois postaux.",
    "Centraliser les échanges sur un outil unique afin de limiter les relances redondantes.",
  ],
  nonProduction: [
    "Identifier plus tôt les dossiers à risque de retard pour lisser la charge de production.",
    "Prévoir une marge dans le planning pour absorber les réaffectations liées aux retards récurrents.",
  ],
  nonCreationPotentiel: [
    "Documenter systématiquement les missions non proposées faute de disponibilité, pour objectiver le manque à gagner.",
    "Réserver du temps commercial en priorité aux clients dont le dossier est à jour.",
  ],
  risques: [
    "Renforcer les alertes d'échéances déclaratives sur les dossiers historiquement à risque.",
    "Formaliser un contrôle qualité systématique avant dépôt sur les dossiers reçus tardivement.",
  ],
};

export function genererPistesAction(synthese: Synthese): PisteAction[] {
  return synthese.composants
    .filter((c) => c.montant > 0)
    .sort((a, b) => b.montant - a.montant)
    .map((c) => ({
      cle: c.cle,
      nom: c.nom,
      montant: c.montant,
      suggestions: PISTES_PAR_COMPOSANT[c.cle] ?? [],
    }));
}
