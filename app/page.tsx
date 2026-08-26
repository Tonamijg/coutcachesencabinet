"use client";

import Link from "next/link";
import { StepShell } from "@/components/StepShell";
import { Callout } from "@/components/Callout";
import { useEvaluation } from "@/context/EvaluationContext";
import { COMPOSANTS, identificationComplete } from "@/lib/types";

export default function PageAccueil() {
  const { etat, pret, setIdentification } = useEvaluation();

  if (!pret) return null;

  const complet = identificationComplete(etat.identification);

  return (
    <StepShell
      etape={0}
      titre="Mode d'emploi"
      objet="Avant de saisir vos données, cette page explique à quoi sert l'outil, comment il raisonne, et les précautions à prendre pour que le résultat soit exploitable."
      suivant={{ href: "/parametres", label: "Démarrer l'évaluation", disabled: !complet }}
    >
      <Section titre="À quoi sert cet outil">
        <p>
          Il transforme en montant financier le temps et les moyens que le cabinet consacre à
          compenser les retards de transmission des pièces. Ce coût est réel et déjà supporté,
          mais il n&apos;apparaît dans aucun compte : les heures de relance sont rémunérées sans
          être imputées à leur cause, et les heures de production perdues ne laissent aucune trace
          comptable.
        </p>
        <p className="mt-2">
          L&apos;outil ne produit pas une mesure comptable mais un{" "}
          <strong>ordre de grandeur documenté et reproductible</strong>.
        </p>
      </Section>

      <Section titre="Les six composants du coût caché">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COMPOSANTS.map((c) => (
            <div key={c.cle} className="rounded-lg border border-brand-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-brand-900">{c.nom}</h3>
              </div>
              <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600">
                {c.nature}
              </span>
              <p className="mt-2 text-sm text-brand-700">{c.definition}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section titre="Deux règles de valorisation à ne pas confondre">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Les <strong>décaissements réels</strong> se valorisent à leur coût effectif : le
            montant sorti de trésorerie.
          </li>
          <li>
            Les <strong>coûts d&apos;opportunité</strong> se valorisent à la contribution horaire à
            la marge sur coûts variables. Une heure perdue ne réduit pas les charges fixes du
            cabinet : elle le prive de la marge qu&apos;elle aurait dégagée. La valoriser au seul
            coût salarial reviendrait à ne compter qu&apos;une partie du dommage.
          </li>
        </ul>
      </Section>

      <Section titre="Précautions d'emploi">
        <Callout variante="avertissement" titre="À lire avant de commencer">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Les résultats dépendent directement des hypothèses saisies à l&apos;étape 1.</li>
            <li>
              Le périmètre recommandé est un <strong>portefeuille homogène</strong> observé sur un
              exercice complet — pas le cabinet entier : la fiabilité prime sur l&apos;exhaustivité.
            </li>
            <li>Les missions de paie sont à exclure du périmètre.</li>
          </ul>
        </Callout>
      </Section>

      <Section titre="Avant de commencer">
        <p className="mb-4">
          Ces informations identifient l&apos;évaluation : elles apparaîtront en en-tête du
          parcours et sur la fiche de détermination exportée.
        </p>
        <div className="grid gap-4 rounded-lg border border-brand-100 bg-white p-5 shadow-sm sm:grid-cols-2">
          <div>
            <label htmlFor="cabinet" className="block text-sm font-medium text-brand-800">
              Nom du cabinet <span className="text-brand-500">*</span>
            </label>
            <input
              id="cabinet"
              type="text"
              value={etat.identification.cabinet}
              onChange={(e) => setIdentification("cabinet", e.target.value)}
              placeholder="ex. Cabinet Dupont & Associés"
              className="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm text-brand-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label htmlFor="nomUtilisateur" className="block text-sm font-medium text-brand-800">
              Votre nom <span className="text-brand-500">*</span>
            </label>
            <input
              id="nomUtilisateur"
              type="text"
              value={etat.identification.nomUtilisateur}
              onChange={(e) => setIdentification("nomUtilisateur", e.target.value)}
              placeholder="ex. Jeanne Martin"
              className="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm text-brand-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>
      </Section>

      <div className="flex flex-col items-center gap-2 pt-4">
        {complet ? (
          <Link
            href="/parametres"
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Démarrer l&apos;évaluation →
          </Link>
        ) : (
          <>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-md bg-brand-100 px-6 py-3 text-base font-semibold text-brand-400"
            >
              Démarrer l&apos;évaluation →
            </button>
            <p className="text-xs text-brand-500">
              Renseignez le nom du cabinet et votre nom ci-dessus pour continuer.
            </p>
          </>
        )}
      </div>
    </StepShell>
  );
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-brand-900">{titre}</h2>
      <div className="text-sm leading-relaxed text-brand-700">{children}</div>
    </section>
  );
}
