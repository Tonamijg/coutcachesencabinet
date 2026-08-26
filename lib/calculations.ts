// Fonctions de calcul pures, transposition directe des formules du classeur Excel source.
// Toute division potentiellement par zéro suit la même convention que le classeur (IFERROR → 0).

import {
  Dysfonctionnements,
  LigneDysfonctionnement,
  LigneReleveTemps,
  LigneRisque,
  Parametres,
  Semaine,
  TauxValorisation,
} from "./types";

const SEMAINES: Semaine[] = ["s1", "s2", "s3", "s4"];

function n(v: number | null | undefined): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function diviserSecurise(numerateur: number, denominateur: number): number {
  if (!denominateur) return 0;
  const resultat = numerateur / denominateur;
  return Number.isFinite(resultat) ? resultat : 0;
}

/** Un paramètre est "renseigné" seulement si l'utilisateur a saisi une valeur numérique. */
export function parametresComplets(p: Parametres): boolean {
  return Object.values(p).every((v) => typeof v === "number" && Number.isFinite(v));
}

// --- Étape 1 : taux de valorisation ---

export function calculerTauxValorisation(p: Parametres): TauxValorisation {
  const margeCoutsVariables = n(p.chiffreAffaires) - n(p.chargesVariables);
  const heuresAttenduesCabinet = n(p.effectifProductif) * n(p.heuresParCollaborateur);
  const contributionHoraire = diviserSecurise(margeCoutsVariables, heuresAttenduesCabinet);
  const tauxSursalaire = n(p.coutHoraireCollaborateur) * 1.25;
  return {
    margeCoutsVariables,
    heuresAttenduesCabinet,
    contributionHoraire,
    tauxSursalaire,
  };
}

// --- Étape 2 : relevé de temps ---

export interface CalculLigneTemps {
  moyenneHebdo: number;
  totalAnnuelHeures: number;
  valorisation: number;
}

function sommeSemaine(valeurs: Record<Semaine, number | null>): number {
  return SEMAINES.reduce((acc, s) => acc + n(valeurs[s]), 0);
}

export function calculerLigneTemps(
  ligne: LigneReleveTemps,
  semainesTravaillees: number,
  contributionHoraire: number
): CalculLigneTemps {
  const totalHeuresSaisies = sommeSemaine(ligne.relance) + sommeSemaine(ligne.reprise);
  const moyenneHebdo = totalHeuresSaisies / 4;
  const totalAnnuelHeures = moyenneHebdo * semainesTravaillees;
  const valorisation = totalAnnuelHeures * contributionHoraire;
  return { moyenneHebdo, totalAnnuelHeures, valorisation };
}

function ligneEstVide(ligne: LigneReleveTemps): boolean {
  return ligne.nom.trim() === "" &&
    SEMAINES.every((s) => ligne.relance[s] == null && ligne.reprise[s] == null);
}

export interface TotauxReleveTemps {
  moyenneHebdoMoyenne: number;
  totalAnnuelHeures: number;
  totalValorisation: number;
  relance: { totalAnnuelHeures: number; valorisation: number };
  reprise: { totalAnnuelHeures: number; valorisation: number };
  equivalentTempsPlein: number;
}

export function calculerTotauxReleveTemps(
  lignes: LigneReleveTemps[],
  semainesTravaillees: number,
  contributionHoraire: number,
  heuresParCollaborateur: number
): TotauxReleveTemps {
  const lignesNonVides = lignes.filter((l) => !ligneEstVide(l));
  const calculs = lignes.map((l) => calculerLigneTemps(l, semainesTravaillees, contributionHoraire));

  const totalAnnuelHeures = calculs.reduce((acc, c) => acc + c.totalAnnuelHeures, 0);
  const totalValorisation = calculs.reduce((acc, c) => acc + c.valorisation, 0);

  const moyennesNonVides = lignes
    .map((l, i) => ({ l, c: calculs[i] }))
    .filter(({ l }) => !ligneEstVide(l));
  const moyenneHebdoMoyenne = diviserSecurise(
    moyennesNonVides.reduce((acc, { c }) => acc + c.moyenneHebdo, 0),
    lignesNonVides.length
  );

  const totalRelanceHeuresHebdo = lignes.reduce((acc, l) => acc + sommeSemaine(l.relance), 0);
  const totalRepriseHeuresHebdo = lignes.reduce((acc, l) => acc + sommeSemaine(l.reprise), 0);

  const relanceAnnuelHeures = (totalRelanceHeuresHebdo / 4) * semainesTravaillees;
  const repriseAnnuelHeures = (totalRepriseHeuresHebdo / 4) * semainesTravaillees;

  return {
    moyenneHebdoMoyenne,
    totalAnnuelHeures,
    totalValorisation,
    relance: {
      totalAnnuelHeures: relanceAnnuelHeures,
      valorisation: relanceAnnuelHeures * contributionHoraire,
    },
    reprise: {
      totalAnnuelHeures: repriseAnnuelHeures,
      valorisation: repriseAnnuelHeures * contributionHoraire,
    },
    equivalentTempsPlein: diviserSecurise(totalAnnuelHeures, heuresParCollaborateur),
  };
}

// --- Étape 3 : dysfonctionnements ---

export function tauxEffectifLigne(
  ligne: LigneDysfonctionnement,
  taux: TauxValorisation,
  parametres: Parametres
): number {
  switch (ligne.origineTaux) {
    case "tauxSursalaire":
      return taux.tauxSursalaire;
    case "ecartChefMission":
      return n(parametres.coutHoraireChefMission) - n(parametres.coutHoraireCollaborateur);
    case "contributionHoraire":
      return taux.contributionHoraire;
    case "libre":
    default:
      return n(ligne.tauxUnitaire);
  }
}

export function calculerMontantLigneDysfonctionnement(
  ligne: LigneDysfonctionnement,
  taux: TauxValorisation,
  parametres: Parametres
): number {
  return n(ligne.quantite) * tauxEffectifLigne(ligne, taux, parametres);
}

export function calculerMontantLigneRisque(ligne: LigneRisque): number {
  return n(ligne.coutUnitaire) * n(ligne.occurrences) * n(ligne.probabilite);
}

export function calculerSousTotal(
  lignes: LigneDysfonctionnement[],
  taux: TauxValorisation,
  parametres: Parametres
): number {
  return lignes.reduce(
    (acc, l) => acc + calculerMontantLigneDysfonctionnement(l, taux, parametres),
    0
  );
}

export function calculerSousTotalRisques(lignes: LigneRisque[]): number {
  return lignes.reduce((acc, l) => acc + calculerMontantLigneRisque(l), 0);
}

// --- Étape 4 : synthèse ---

export interface LigneSynthese {
  cle: string;
  nom: string;
  nature: string;
  montant: number;
  part: number;
}

export interface Synthese {
  composants: LigneSynthese[];
  total: number;
}

export function calculerSynthese(
  dysfonctionnements: Dysfonctionnements,
  totalSurtemps: number,
  taux: TauxValorisation,
  parametres: Parametres
): Synthese {
  const sursalaire = calculerSousTotal(dysfonctionnements.sursalaire, taux, parametres);
  const surconsommation = calculerSousTotal(dysfonctionnements.surconsommation, taux, parametres);
  const nonProduction = calculerSousTotal(dysfonctionnements.nonProduction, taux, parametres);
  const nonCreationPotentiel = calculerSousTotal(
    dysfonctionnements.nonCreationPotentiel,
    taux,
    parametres
  );
  const risques = calculerSousTotalRisques(dysfonctionnements.risques);

  const total =
    sursalaire + totalSurtemps + surconsommation + nonProduction + nonCreationPotentiel + risques;

  const brut: Omit<LigneSynthese, "part">[] = [
    { cle: "sursalaire", nom: "Sursalaire", nature: "Décaissement réel", montant: sursalaire },
    { cle: "surtemps", nom: "Surtemps", nature: "Coût d'opportunité", montant: totalSurtemps },
    {
      cle: "surconsommation",
      nom: "Surconsommation",
      nature: "Décaissement réel",
      montant: surconsommation,
    },
    {
      cle: "nonProduction",
      nom: "Non-production",
      nature: "Coût d'opportunité",
      montant: nonProduction,
    },
    {
      cle: "nonCreationPotentiel",
      nom: "Non-création de potentiel",
      nature: "Coût d'opportunité différé",
      montant: nonCreationPotentiel,
    },
    { cle: "risques", nom: "Risques", nature: "Coût probabilisé", montant: risques },
  ];

  return {
    total,
    composants: brut.map((c) => ({ ...c, part: diviserSecurise(c.montant, total) })),
  };
}

export interface LecturesDerivees {
  coutParCollaborateur: number;
  coutParDossier: number;
  partDecaissementReel: number;
  partCoutOpportunite: number;
  partCoutProbabilise: number;
  equivalentTempsPlein: number;
  coutRapporteMCV: number;
}

export function calculerLecturesDerivees(
  synthese: Synthese,
  parametres: Parametres,
  taux: TauxValorisation,
  totalHeuresCollecte: number
): LecturesDerivees {
  const parCle = Object.fromEntries(synthese.composants.map((c) => [c.cle, c.montant]));
  return {
    coutParCollaborateur: diviserSecurise(synthese.total, n(parametres.effectifProductif)),
    coutParDossier: diviserSecurise(synthese.total, n(parametres.nombreDossiers)),
    partDecaissementReel: diviserSecurise(
      n(parCle.sursalaire) + n(parCle.surconsommation),
      synthese.total
    ),
    partCoutOpportunite: diviserSecurise(
      n(parCle.surtemps) + n(parCle.nonProduction) + n(parCle.nonCreationPotentiel),
      synthese.total
    ),
    partCoutProbabilise: diviserSecurise(n(parCle.risques), synthese.total),
    equivalentTempsPlein: diviserSecurise(totalHeuresCollecte, n(parametres.heuresParCollaborateur)),
    coutRapporteMCV: diviserSecurise(synthese.total, taux.margeCoutsVariables),
  };
}
