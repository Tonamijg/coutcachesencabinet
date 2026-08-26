"use client";

import { StepShell } from "@/components/StepShell";
import { Callout } from "@/components/Callout";
import { HeureCell } from "@/components/HeureCell";
import { useEvaluation } from "@/context/EvaluationContext";
import {
  calculerLigneTemps,
  calculerTauxValorisation,
  calculerTotauxReleveTemps,
  parametresComplets,
} from "@/lib/calculations";
import { formatHeures, formatMontant, formatNombre2 } from "@/lib/format";
import { Semaine } from "@/lib/types";
import Link from "next/link";

const SEMAINES: { cle: Semaine; label: string }[] = [
  { cle: "s1", label: "S1" },
  { cle: "s2", label: "S2" },
  { cle: "s3", label: "S3" },
  { cle: "s4", label: "S4" },
];

const FONCTIONS_SUGGEREES = [
  "Collaborateur comptable",
  "Chef de mission",
  "Alternant",
  "Autre",
];

export default function PageReleveTemps() {
  const { etat, ajouterLigneTemps, supprimerLigneTemps, modifierLigneTemps, pret } =
    useEvaluation();
  const { parametres, releveTemps } = etat;

  if (!pret) return null;

  const parametresOk = parametresComplets(parametres);
  const taux = calculerTauxValorisation(parametres);
  const semaines = parametres.semainesTravaillees ?? 0;
  const heuresParCollaborateur = parametres.heuresParCollaborateur ?? 0;

  const totaux = calculerTotauxReleveTemps(
    releveTemps,
    semaines,
    taux.contributionHoraire,
    heuresParCollaborateur
  );

  return (
    <StepShell
      etape={2}
      titre="Relevé de temps (relance et reprise)"
      objet="C'est l'étape déterminante de l'évaluation : elle mesure le temps réellement consacré à compenser les retards de transmission, poste par poste et collaborateur par collaborateur."
      precedent={{ href: "/parametres", label: "Paramètres" }}
      suivant={{ href: "/dysfonctionnements" }}
    >
      {!parametresOk && (
        <Callout variante="avertissement" titre="Paramètres incomplets">
          La contribution horaire n&apos;est pas encore calculable : retournez à{" "}
          <Link href="/parametres" className="underline">
            l&apos;étape Paramètres
          </Link>{" "}
          pour la renseigner. Les valorisations ci-dessous resteront à zéro tant que ces données
          manquent.
        </Callout>
      )}

      <Callout titre="Comment renseigner ce relevé">
        Auto-relevé sur quatre semaines consécutives, hors période de forte saisonnalité. Saisissez
        les temps en heures décimales (0,5 = 30 minutes). Distinguez la <strong>RELANCE</strong>{" "}
        (temps passé à réclamer les pièces) de la <strong>REPRISE</strong> (temps passé à corriger
        les erreurs nées d&apos;un traitement dans l&apos;urgence) : ces deux postes relèvent du
        même composant mais n&apos;appellent pas les mêmes actions correctives.
      </Callout>

      <section className="overflow-x-auto rounded-lg border border-brand-100 bg-white shadow-sm">
        <table className="min-w-[980px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-brand-100 bg-brand-50 text-left text-brand-700">
              <th rowSpan={2} className="sticky left-0 bg-brand-50 px-3 py-2 font-semibold">
                Collaborateur
              </th>
              <th rowSpan={2} className="px-3 py-2 font-semibold">
                Fonction
              </th>
              <th colSpan={4} className="border-l border-brand-100 px-3 py-1.5 text-center font-semibold">
                Temps de RELANCE (h)
              </th>
              <th colSpan={4} className="border-l border-brand-100 px-3 py-1.5 text-center font-semibold">
                Temps de REPRISE (h)
              </th>
              <th rowSpan={2} className="border-l border-brand-100 px-3 py-2 text-right font-semibold">
                Moy. hebdo
              </th>
              <th rowSpan={2} className="px-3 py-2 text-right font-semibold">
                Total annuel
              </th>
              <th rowSpan={2} className="px-3 py-2 text-right font-semibold">
                Valorisation
              </th>
              <th rowSpan={2} className="px-2 py-2" />
            </tr>
            <tr className="border-b border-brand-100 bg-brand-50 text-brand-500">
              {SEMAINES.map((s) => (
                <th key={`r-${s.cle}`} className="border-l border-brand-100 px-2 py-1 text-center font-medium">
                  {s.label}
                </th>
              ))}
              {SEMAINES.map((s) => (
                <th key={`p-${s.cle}`} className="border-l border-brand-100 px-2 py-1 text-center font-medium">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {releveTemps.length === 0 && (
              <tr>
                <td colSpan={12} className="px-3 py-6 text-center text-brand-400">
                  Aucun collaborateur ajouté. Cliquez sur « Ajouter un collaborateur » pour
                  commencer le relevé.
                </td>
              </tr>
            )}
            {releveTemps.map((ligne) => {
              const calcul = calculerLigneTemps(ligne, semaines, taux.contributionHoraire);
              return (
                <tr key={ligne.id} className="border-b border-brand-50 last:border-0">
                  <td className="sticky left-0 bg-white px-3 py-1.5">
                    <input
                      type="text"
                      value={ligne.nom}
                      onChange={(e) => modifierLigneTemps(ligne.id, { nom: e.target.value })}
                      placeholder="Nom / identifiant"
                      className="w-32 rounded border border-brand-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      type="text"
                      list="fonctions-suggerees"
                      value={ligne.fonction}
                      onChange={(e) => modifierLigneTemps(ligne.id, { fonction: e.target.value })}
                      placeholder="Fonction"
                      className="w-36 rounded border border-brand-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </td>
                  {SEMAINES.map((s) => (
                    <td key={`r-${s.cle}`} className="border-l border-brand-50 px-1.5 py-1.5 text-center">
                      <HeureCell
                        label={`Relance ${s.label} — ${ligne.nom || "collaborateur"}`}
                        valeur={ligne.relance[s.cle]}
                        onChange={(v) =>
                          modifierLigneTemps(ligne.id, { relance: { ...ligne.relance, [s.cle]: v } })
                        }
                      />
                    </td>
                  ))}
                  {SEMAINES.map((s) => (
                    <td key={`p-${s.cle}`} className="border-l border-brand-50 px-1.5 py-1.5 text-center">
                      <HeureCell
                        label={`Reprise ${s.label} — ${ligne.nom || "collaborateur"}`}
                        valeur={ligne.reprise[s.cle]}
                        onChange={(v) =>
                          modifierLigneTemps(ligne.id, { reprise: { ...ligne.reprise, [s.cle]: v } })
                        }
                      />
                    </td>
                  ))}
                  <td className="border-l border-brand-50 px-3 py-1.5 text-right tabular-nums text-brand-700">
                    {formatNombre2(calcul.moyenneHebdo)}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-brand-700">
                    {formatHeures(calcul.totalAnnuelHeures)}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums font-medium text-brand-900">
                    {formatMontant(calcul.valorisation)}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => supprimerLigneTemps(ligne.id)}
                      aria-label={`Supprimer la ligne de ${ligne.nom || "ce collaborateur"}`}
                      className="text-brand-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {releveTemps.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-brand-200 bg-brand-50 font-semibold text-brand-900">
                <td colSpan={2} className="sticky left-0 bg-brand-50 px-3 py-2">
                  TOTAL / MOYENNE
                </td>
                <td colSpan={8} />
                <td className="border-l border-brand-100 px-3 py-2 text-right tabular-nums">
                  {formatNombre2(totaux.moyenneHebdoMoyenne)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatHeures(totaux.totalAnnuelHeures)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatMontant(totaux.totalValorisation)}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
        <datalist id="fonctions-suggerees">
          {FONCTIONS_SUGGEREES.map((f) => (
            <option key={f} value={f} />
          ))}
        </datalist>
      </section>

      <p className="text-xs text-brand-400">
        Moy. hebdo = (somme des 8 valeurs saisies) ÷ 4 · Total annuel = Moy. hebdo × Semaines
        travaillées (étape 1) · Valorisation = Total annuel × Contribution horaire (étape 1).
      </p>

      <div>
        <button
          type="button"
          onClick={ajouterLigneTemps}
          className="inline-flex items-center gap-2 rounded-md border border-brand-300 bg-white px-4 py-2 text-sm font-medium text-brand-700 shadow-sm transition hover:bg-brand-50"
        >
          + Ajouter un collaborateur
        </button>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-brand-900">
          Décomposition relance / reprise
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <BlocDecomposition
            label="Temps de relance"
            heures={totaux.relance.totalAnnuelHeures}
            montant={totaux.relance.valorisation}
          />
          <BlocDecomposition
            label="Temps de reprise (traitement dans l'urgence)"
            heures={totaux.reprise.totalAnnuelHeures}
            montant={totaux.reprise.valorisation}
          />
          <div className="rounded-lg border border-brand-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
              Équivalent temps plein mobilisé
            </p>
            <p className="mt-1 text-xl font-bold text-brand-900">
              {formatNombre2(totaux.equivalentTempsPlein)} ETP
            </p>
            <p className="mt-1 text-xs text-brand-400">
              Total annuel (h) ÷ heures attendues par collaborateur
            </p>
          </div>
        </div>
      </section>

      <Callout>
        Le relevé sur quatre semaines est extrapolé à l&apos;année par multiplication par le
        nombre de semaines travaillées. Cette extrapolation suppose que la période observée est
        représentative : évitez les périodes de clôture ou de forte charge déclarative.
      </Callout>
    </StepShell>
  );
}

function BlocDecomposition({
  label,
  heures,
  montant,
}: {
  label: string;
  heures: number;
  montant: number;
}) {
  return (
    <div className="rounded-lg border border-brand-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-brand-900">{formatMontant(montant)}</p>
      <p className="mt-1 text-xs text-brand-400">{formatHeures(heures)} / an</p>
    </div>
  );
}
