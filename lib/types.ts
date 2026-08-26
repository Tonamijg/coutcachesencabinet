// Types du parcours d'évaluation des coûts cachés.
// Un champ numérique non encore saisi par l'utilisateur vaut `null` :
// on ne pré-remplit jamais avec les exemples du classeur source.

export type ValeurSaisie = number | null;

export interface Parametres {
  chiffreAffaires: ValeurSaisie;
  chargesVariables: ValeurSaisie;
  effectifProductif: ValeurSaisie;
  heuresParCollaborateur: ValeurSaisie;
  semainesTravaillees: ValeurSaisie;
  coutHoraireCollaborateur: ValeurSaisie;
  coutHoraireChefMission: ValeurSaisie;
  tauxHoraireFacture: ValeurSaisie;
  nombreDossiers: ValeurSaisie;
}

export const PARAMETRES_VIDES: Parametres = {
  chiffreAffaires: null,
  chargesVariables: null,
  effectifProductif: null,
  heuresParCollaborateur: null,
  semainesTravaillees: null,
  coutHoraireCollaborateur: null,
  coutHoraireChefMission: null,
  tauxHoraireFacture: null,
  nombreDossiers: null,
};

export interface TauxValorisation {
  margeCoutsVariables: number;
  heuresAttenduesCabinet: number;
  contributionHoraire: number;
  tauxSursalaire: number;
}

export type Semaine = "s1" | "s2" | "s3" | "s4";

export interface LigneReleveTemps {
  id: string;
  nom: string;
  fonction: string;
  relance: Record<Semaine, ValeurSaisie>;
  reprise: Record<Semaine, ValeurSaisie>;
}

export function nouvelleLigneReleveTemps(): LigneReleveTemps {
  return {
    id: crypto.randomUUID(),
    nom: "",
    fonction: "",
    relance: { s1: null, s2: null, s3: null, s4: null },
    reprise: { s1: null, s2: null, s3: null, s4: null },
  };
}

// --- Étape 3 : dysfonctionnements ---

/**
 * Origine du taux unitaire d'une ligne de dysfonctionnement :
 * - "libre" : l'utilisateur saisit lui-même le taux.
 * - toute autre valeur : le taux est repris automatiquement des paramètres (étape 1)
 *   et n'est pas modifiable sur cette ligne.
 */
export type OrigineTaux =
  | "libre"
  | "tauxSursalaire"
  | "ecartChefMission"
  | "contributionHoraire";

export interface LigneDysfonctionnement {
  id: string;
  nom: string;
  unite: string;
  quantite: ValeurSaisie;
  origineTaux: OrigineTaux;
  /** Taux saisi librement par l'utilisateur ; ignoré si origineTaux !== "libre". */
  tauxUnitaire: ValeurSaisie;
  commentaire?: string;
  supprimable: boolean;
}

export interface LigneRisque {
  id: string;
  nom: string;
  coutUnitaire: ValeurSaisie;
  occurrences: ValeurSaisie;
  probabilite: ValeurSaisie;
  commentaire?: string;
  supprimable: boolean;
}

export interface Dysfonctionnements {
  sursalaire: LigneDysfonctionnement[];
  surconsommation: LigneDysfonctionnement[];
  nonProduction: LigneDysfonctionnement[];
  nonCreationPotentiel: LigneDysfonctionnement[];
  risques: LigneRisque[];
}

export interface EvaluationState {
  version: 1;
  parametres: Parametres;
  releveTemps: LigneReleveTemps[];
  dysfonctionnements: Dysfonctionnements;
}

export const COMPOSANTS = [
  {
    cle: "sursalaire",
    nom: "Sursalaire",
    nature: "Décaissement réel",
    definition:
      "Écart entre le coût de la personne mobilisée pour compenser le retard et celui normalement prévu.",
  },
  {
    cle: "surtemps",
    nom: "Surtemps",
    nature: "Coût d'opportunité",
    definition:
      "Temps passé à corriger le dysfonctionnement : relances auprès des clients, reprises de saisie.",
  },
  {
    cle: "surconsommation",
    nom: "Surconsommation",
    nature: "Décaissement réel",
    definition:
      "Biens et services consommés en excès du fait du retard : déplacements, envois, consommables.",
  },
  {
    cle: "nonProduction",
    nom: "Non-production",
    nature: "Coût d'opportunité",
    definition:
      "Activité productive non réalisée du fait de la désorganisation induite par le dysfonctionnement.",
  },
  {
    cle: "nonCreationPotentiel",
    nom: "Non-création de potentiel",
    nature: "Coût d'opportunité différé",
    definition:
      "Missions ou clients non développés faute de disponibilité pour prospecter ou conseiller.",
  },
  {
    cle: "risques",
    nom: "Risques",
    nature: "Coût probabilisé",
    definition:
      "Coût éventuel d'un événement redouté (pénalité, contentieux), pondéré par sa probabilité de survenance.",
  },
] as const;

export const ETAPES = [
  { chemin: "/", titre: "Mode d'emploi" },
  { chemin: "/parametres", titre: "Paramètres" },
  { chemin: "/releve-temps", titre: "Relevé de temps" },
  { chemin: "/dysfonctionnements", titre: "Dysfonctionnements" },
  { chemin: "/synthese", titre: "Synthèse" },
] as const;
