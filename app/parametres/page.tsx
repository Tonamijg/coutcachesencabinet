"use client";

import { StepShell } from "@/components/StepShell";
import { NumberField } from "@/components/NumberField";
import { Callout } from "@/components/Callout";
import { useEvaluation } from "@/context/EvaluationContext";
import { calculerTauxValorisation, parametresComplets } from "@/lib/calculations";
import { formatMontant, formatMontantPrecis, formatHeures } from "@/lib/format";
import { Parametres } from "@/lib/types";

interface Champ {
  cle: keyof Parametres;
  label: string;
  unite: string;
  aide: string;
  step?: number;
}

const CHAMPS: Champ[] = [
  {
    cle: "chiffreAffaires",
    label: "Chiffre d'affaires annuel",
    unite: "€",
    aide: "Compte de résultat de l'exercice de référence.",
  },
  {
    cle: "chargesVariables",
    label: "Charges variables annuelles",
    unite: "€",
    aide: "Sous-traitance, déplacements refacturables, consommables.",
  },
  {
    cle: "effectifProductif",
    label: "Effectif productif (collaborateurs)",
    unite: "pers.",
    aide: "Personnes affectées à la production, hors fonctions support.",
  },
  {
    cle: "heuresParCollaborateur",
    label: "Heures de travail attendues par collaborateur",
    unite: "h/an",
    aide: "Potentiel horaire théorique, facturable et non facturable (défaut suggéré : 1 500).",
  },
  {
    cle: "semainesTravaillees",
    label: "Semaines travaillées par an",
    unite: "sem.",
    aide: "52 semaines diminuées des congés, RTT et jours fériés (défaut suggéré : 44).",
    step: 0.5,
  },
  {
    cle: "coutHoraireCollaborateur",
    label: "Coût horaire chargé — collaborateur",
    unite: "€/h",
    aide: "Salaire brut chargé rapporté aux heures de travail.",
    step: 0.5,
  },
  {
    cle: "coutHoraireChefMission",
    label: "Coût horaire chargé — chef de mission",
    unite: "€/h",
    aide: "À ajuster selon la grille du cabinet.",
    step: 0.5,
  },
  {
    cle: "tauxHoraireFacture",
    label: "Taux horaire moyen facturé",
    unite: "€/h",
    aide: "Pour information : sert au calcul du manque à gagner facturable.",
    step: 0.5,
  },
  {
    cle: "nombreDossiers",
    label: "Nombre de dossiers du périmètre évalué",
    unite: "doss.",
    aide: "Périmètre restreint recommandé : un portefeuille homogène.",
  },
];

export default function PageParametres() {
  const { etat, setParametre, pret } = useEvaluation();
  const { parametres } = etat;
  const taux = calculerTauxValorisation(parametres);
  const complet = parametresComplets(parametres);

  if (!pret) return null;

  return (
    <StepShell
      etape={1}
      titre="Paramètres de gestion du cabinet"
      objet="Ces neuf données de gestion servent de base à tout le calcul. Elles déterminent en particulier la contribution horaire, le taux qui sert à valoriser tous les coûts d'opportunité de l'évaluation."
      precedent={{ href: "/", label: "Mode d'emploi" }}
      suivant={{ href: "/releve-temps", disabled: !complet }}
    >
      <section>
        <h2 className="mb-3 text-lg font-semibold text-brand-900">Données de gestion de l&apos;exercice</h2>
        <p className="mb-4 text-sm text-brand-600">
          Tous les champs sont obligatoires. Saisissez vos propres données de gestion — aucune
          valeur n&apos;est pré-remplie.
        </p>
        <div className="grid gap-5 rounded-lg border border-brand-100 bg-white p-5 shadow-sm sm:grid-cols-2">
          {CHAMPS.map((champ) => (
            <NumberField
              key={champ.cle}
              label={champ.label}
              unite={champ.unite}
              aide={champ.aide}
              required
              step={champ.step ?? 1}
              valeur={parametres[champ.cle]}
              onChange={(v) => setParametre(champ.cle, v)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-brand-900">Taux de valorisation calculés</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <IndicateurCard
            label="Marge sur coûts variables (MCV)"
            valeur={formatMontant(taux.margeCoutsVariables)}
            formule="Chiffre d'affaires − Charges variables"
          />
          <IndicateurCard
            label="Heures de travail attendues (total cabinet)"
            valeur={formatHeures(taux.heuresAttenduesCabinet)}
            formule="Effectif productif × Heures par collaborateur"
          />
          <IndicateurCard
            pivot
            label="Contribution horaire à la marge sur coûts variables"
            valeur={formatMontantPrecis(taux.contributionHoraire) + " /h"}
            formule="MCV ÷ Heures de travail attendues"
          />
          <IndicateurCard
            label="Taux horaire de sursalaire"
            valeur={formatMontantPrecis(taux.tauxSursalaire) + " /h"}
            formule="Coût horaire chargé collaborateur × 1,25"
          />
        </div>

        <div className="mt-4">
          <Callout variante="pivot" titre="La valeur pivot de l'outil">
            Une heure perdue prive le cabinet de la marge qu&apos;elle aurait dégagée, pas
            seulement de son coût salarial. Cette contribution horaire sert à valoriser tous les
            coûts d&apos;opportunité de l&apos;évaluation.
          </Callout>
        </div>
      </section>

      <Callout variante="avertissement" titre="Hypothèses structurantes à garder en tête">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            La majoration de 25 % est une hypothèse conventionnelle, à ajuster selon la convention
            collective applicable au cabinet.
          </li>
          <li>Le potentiel horaire de 1 500 heures suppose un temps plein.</li>
          <li>
            La contribution horaire lisse les écarts entre missions : elle vaut pour un
            raisonnement d&apos;ensemble, pas pour l&apos;arbitrage d&apos;un dossier isolé.
          </li>
        </ul>
      </Callout>
    </StepShell>
  );
}

function IndicateurCard({
  label,
  valeur,
  formule,
  pivot = false,
}: {
  label: string;
  valeur: string;
  formule: string;
  pivot?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 shadow-sm ${
        pivot ? "border-brand-400 bg-brand-800 text-white ring-2 ring-brand-200" : "border-brand-100 bg-white"
      }`}
    >
      <p className={`text-xs font-medium uppercase tracking-wide ${pivot ? "text-brand-100" : "text-brand-500"}`}>
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${pivot ? "text-white" : "text-brand-900"}`}>{valeur}</p>
      <p className={`mt-1 text-xs ${pivot ? "text-brand-200" : "text-brand-400"}`}>{formule}</p>
    </div>
  );
}
