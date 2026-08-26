import {
  Dysfonctionnements,
  EvaluationState,
  IDENTIFICATION_VIDE,
  LigneDysfonctionnement,
  LigneRisque,
  PARAMETRES_VIDES,
} from "./types";

// Identifiants stables pour les lignes pré-nommées (pas de crypto.randomUUID
// ici : ces lignes existent dès le chargement du module, y compris côté serveur).
let compteurId = 0;
function idFixe(prefixe: string): string {
  compteurId += 1;
  return `${prefixe}-${compteurId}`;
}

function lignePreNommee(
  partial: Omit<LigneDysfonctionnement, "id" | "supprimable">
): LigneDysfonctionnement {
  return { ...partial, id: idFixe(partial.nom), supprimable: false };
}

function ligneRisquePreNommee(
  partial: Omit<LigneRisque, "id" | "supprimable">
): LigneRisque {
  return { ...partial, id: idFixe(partial.nom), supprimable: false };
}

export function creerDysfonctionnementsInitiaux(): Dysfonctionnements {
  return {
    sursalaire: [
      lignePreNommee({
        nom: "Heures supplémentaires payées pour rattraper un retard de pièces",
        unite: "h/an",
        quantite: null,
        origineTaux: "tauxSursalaire",
        tauxUnitaire: null,
        commentaire: "Coût horaire chargé collaborateur majoré de 25 %",
      }),
      lignePreNommee({
        nom: "Heures de chef de mission mobilisées sur des travaux de collaborateur",
        unite: "h/an",
        quantite: null,
        origineTaux: "ecartChefMission",
        tauxUnitaire: null,
        commentaire:
          "Écart entre le coût de la personne mobilisée et celui normalement prévu",
      }),
      lignePreNommee({
        nom: "Recours à un renfort externe ou intérimaire",
        unite: "h/an",
        quantite: null,
        origineTaux: "libre",
        tauxUnitaire: null,
        commentaire: "Coût horaire facturé par le prestataire (ex. 45 €/h)",
      }),
    ],
    surconsommation: [
      lignePreNommee({
        nom: "Déplacements effectués pour récupérer des pièces",
        unite: "déplac.",
        quantite: null,
        origineTaux: "libre",
        tauxUnitaire: null,
        commentaire:
          "Coût moyen d'un déplacement : barème kilométrique et temps de trajet",
      }),
      lignePreNommee({
        nom: "Envois postaux et frais de relance matérielle",
        unite: "envois",
        quantite: null,
        origineTaux: "libre",
        tauxUnitaire: null,
        commentaire: "Affranchissement et fournitures",
      }),
      lignePreNommee({
        nom: "Consommables liés au traitement du papier (impression, numérisation)",
        unite: "forfait",
        quantite: null,
        origineTaux: "libre",
        tauxUnitaire: null,
        commentaire: "Estimation annuelle rattachable aux flux papier",
      }),
    ],
    nonProduction: [
      lignePreNommee({
        nom: "Heures perdues du fait de la désorganisation du planning",
        unite: "h/an",
        quantite: null,
        origineTaux: "contributionHoraire",
        tauxUnitaire: null,
        commentaire: "Réaffectations, reprises de dossier, temps de reprise en main",
      }),
      lignePreNommee({
        nom: "Heures perdues du fait du retard de production des livrables",
        unite: "h/an",
        quantite: null,
        origineTaux: "contributionHoraire",
        tauxUnitaire: null,
        commentaire: "Décalage de mission, immobilisation de ressources",
      }),
    ],
    nonCreationPotentiel: [
      lignePreNommee({
        nom: "Missions de conseil non proposées faute de disponibilité",
        unite: "missions",
        quantite: null,
        origineTaux: "libre",
        tauxUnitaire: null,
        commentaire:
          "Marge attendue par mission, à estimer à partir des missions comparables réalisées",
      }),
      lignePreNommee({
        nom: "Clients perdus ou non développés du fait de la qualité de service",
        unite: "clients",
        quantite: null,
        origineTaux: "libre",
        tauxUnitaire: null,
        commentaire: "Marge annuelle moyenne par client du segment concerné",
      }),
    ],
    risques: [
      ligneRisquePreNommee({
        nom: "Pénalité ou intérêt de retard sur déclaration fiscale",
        coutUnitaire: null,
        occurrences: null,
        probabilite: null,
        commentaire:
          "Coût moyen constaté ou estimé ; probabilité issue de l'historique du cabinet",
      }),
      ligneRisquePreNommee({
        nom: "Rectification consécutive à une pièce manquante",
        coutUnitaire: null,
        occurrences: null,
        probabilite: null,
        commentaire: "Inclut le temps de traitement du contentieux",
      }),
      ligneRisquePreNommee({
        nom: "Mise en cause de la responsabilité civile professionnelle",
        coutUnitaire: null,
        occurrences: null,
        probabilite: null,
        commentaire:
          "Franchise et coût de gestion du sinistre, hors indemnisation assurée",
      }),
    ],
  };
}

export function creerEtatInitial(): EvaluationState {
  return {
    version: 1,
    identification: { ...IDENTIFICATION_VIDE },
    parametres: { ...PARAMETRES_VIDES },
    releveTemps: [],
    dysfonctionnements: creerDysfonctionnementsInitiaux(),
  };
}
