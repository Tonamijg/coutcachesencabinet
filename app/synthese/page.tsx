"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StepShell } from "@/components/StepShell";
import { Callout } from "@/components/Callout";
import { SummaryChart } from "@/components/SummaryChart";
import { useEvaluation } from "@/context/EvaluationContext";
import {
  calculerLecturesDerivees,
  calculerSynthese,
  calculerTauxValorisation,
  calculerTotauxReleveTemps,
} from "@/lib/calculations";
import { formatMontant, formatMontantPrecis, formatNombre2, formatPourcentage } from "@/lib/format";

const MISE_EN_GARDE =
  "Le montant obtenu constitue un ordre de grandeur documenté et non une mesure comptable. Les composants relevant du coût d'opportunité reposent sur une contribution horaire moyenne qui lisse les écarts entre missions, et le composant risques suppose des probabilités estimées. La valeur de l'exercice tient moins à l'exactitude du montant qu'au fait de rendre visible et discutable une charge jusque-là absente de tout compte.";

export default function PageSynthese() {
  const router = useRouter();
  const { etat, pret, reinitialiser } = useEvaluation();
  const [genererEnCours, setGenererEnCours] = useState(false);
  const [erreurPdf, setErreurPdf] = useState<string | null>(null);

  if (!pret) return null;

  const { parametres, releveTemps, dysfonctionnements } = etat;
  const taux = calculerTauxValorisation(parametres);
  const totauxTemps = calculerTotauxReleveTemps(
    releveTemps,
    parametres.semainesTravaillees ?? 0,
    taux.contributionHoraire,
    parametres.heuresParCollaborateur ?? 0
  );
  const synthese = calculerSynthese(dysfonctionnements, totauxTemps.totalValorisation, taux, parametres);
  const lectures = calculerLecturesDerivees(synthese, parametres, taux, totauxTemps.totalAnnuelHeures);

  async function exporterPdf() {
    setErreurPdf(null);
    setGenererEnCours(true);
    try {
      const [{ pdf }, { FicheDetermination }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/FicheDetermination"),
      ]);
      const document = (
        <FicheDetermination
          parametres={parametres}
          taux={taux}
          synthese={synthese}
          lectures={lectures}
          dateGeneration={new Date()}
        />
      );
      const blob = await pdf(document).toBlob();
      const url = URL.createObjectURL(blob);
      const lien = window.document.createElement("a");
      lien.href = url;
      lien.download = "fiche-determination-couts-caches.pdf";
      window.document.body.appendChild(lien);
      lien.click();
      lien.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setErreurPdf("La génération du PDF a échoué. Réessayez, ou vérifiez votre connexion.");
    } finally {
      setGenererEnCours(false);
    }
  }

  function recommencer() {
    const confirme = window.confirm(
      "Recommencer une évaluation effacera toutes les données saisies. Confirmez-vous ?"
    );
    if (confirme) {
      reinitialiser();
      router.push("/");
    }
  }

  return (
    <StepShell
      etape={4}
      titre="Synthèse de l'évaluation"
      objet="Aucune saisie sur cette page : elle rassemble les montants calculés aux étapes précédentes en un résultat unique, exportable pour votre dossier de travail."
      precedent={{ href: "/dysfonctionnements", label: "Dysfonctionnements" }}
    >
      <section className="overflow-x-auto rounded-lg border border-brand-100 bg-white shadow-sm">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-brand-100 bg-brand-50 text-left text-brand-700">
              <th className="px-4 py-2.5 font-semibold">Composant</th>
              <th className="px-4 py-2.5 font-semibold">Nature</th>
              <th className="px-4 py-2.5 text-right font-semibold">Montant</th>
              <th className="px-4 py-2.5 text-right font-semibold">% du total</th>
            </tr>
          </thead>
          <tbody>
            {synthese.composants.map((c) => (
              <tr key={c.cle} className="border-b border-brand-50">
                <td className="px-4 py-2.5 font-medium text-brand-900">{c.nom}</td>
                <td className="px-4 py-2.5 text-brand-600">{c.nature}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-brand-900">
                  {formatMontant(c.montant)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-brand-600">
                  {formatPourcentage(c.part)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-brand-900 text-white">
              <td className="px-4 py-3 text-base font-bold" colSpan={2}>
                TOTAL DU COÛT CACHÉ ÉVALUÉ
              </td>
              <td className="px-4 py-3 text-right text-base font-bold tabular-nums">
                {formatMontant(synthese.total)}
              </td>
              <td className="px-4 py-3 text-right text-base font-bold tabular-nums">100 %</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="rounded-lg border border-brand-400 bg-white p-6 text-center shadow-sm ring-1 ring-brand-100">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-500">
          Coût caché total évalué
        </p>
        <p className="mt-2 text-5xl font-extrabold text-brand-900">{formatMontant(synthese.total)}</p>
        <p className="mt-1 text-sm text-brand-500">par an, sur le périmètre évalué</p>
      </section>

      <section className="rounded-lg border border-brand-100 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-brand-900">Répartition par composant</h2>
        <SummaryChart composants={synthese.composants} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-brand-900">Lectures dérivées</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Indicateur label="Coût caché par collaborateur" valeur={formatMontant(lectures.coutParCollaborateur)} />
          <Indicateur label="Coût caché par dossier du périmètre" valeur={formatMontantPrecis(lectures.coutParDossier)} />
          <Indicateur label="Part du coût en décaissement réel" valeur={formatPourcentage(lectures.partDecaissementReel)} />
          <Indicateur label="Part du coût en coût d'opportunité" valeur={formatPourcentage(lectures.partCoutOpportunite)} />
          <Indicateur label="Part du coût probabilisé" valeur={formatPourcentage(lectures.partCoutProbabilise)} />
          <Indicateur label="Équivalent temps plein mobilisé" valeur={`${formatNombre2(lectures.equivalentTempsPlein)} ETP`} />
          <Indicateur label="Coût caché rapporté à la MCV" valeur={formatPourcentage(lectures.coutRapporteMCV)} />
        </div>
      </section>

      <Callout variante="avertissement" titre="Mise en garde méthodologique">
        {MISE_EN_GARDE}
      </Callout>

      {erreurPdf && (
        <Callout variante="avertissement" titre="Export impossible">
          {erreurPdf}
        </Callout>
      )}

      <div className="flex flex-col items-center gap-3 border-t border-brand-100 pt-6 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={exporterPdf}
          disabled={genererEnCours}
          className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-70"
        >
          {genererEnCours ? "Génération en cours…" : "Générer la fiche de détermination (PDF)"}
        </button>
        <button
          type="button"
          onClick={recommencer}
          className="inline-flex items-center gap-2 rounded-md border border-brand-300 bg-white px-5 py-3 text-sm font-medium text-brand-700 shadow-sm transition hover:bg-brand-50"
        >
          Recommencer une évaluation
        </button>
      </div>
    </StepShell>
  );
}

function Indicateur({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="rounded-lg border border-brand-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-brand-900">{valeur}</p>
    </div>
  );
}
