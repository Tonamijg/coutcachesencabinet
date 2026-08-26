"use client";

import { NombreCell } from "./NombreCell";
import { calculerMontantLigneDysfonctionnement, tauxEffectifLigne } from "@/lib/calculations";
import { formatMontant, formatMontantPrecis } from "@/lib/format";
import { LigneDysfonctionnement, Parametres, TauxValorisation } from "@/lib/types";

interface DysfunctionBlockProps {
  titre: string;
  nature: string;
  lignes: LigneDysfonctionnement[];
  taux: TauxValorisation;
  parametres: Parametres;
  avertissement?: React.ReactNode;
  onAjouter: () => void;
  onSupprimer: (id: string) => void;
  onModifier: (id: string, patch: Partial<LigneDysfonctionnement>) => void;
}

export function DysfunctionBlock({
  titre,
  nature,
  lignes,
  taux,
  parametres,
  avertissement,
  onAjouter,
  onSupprimer,
  onModifier,
}: DysfunctionBlockProps) {
  const sousTotal = lignes.reduce(
    (acc, l) => acc + calculerMontantLigneDysfonctionnement(l, taux, parametres),
    0
  );

  return (
    <section className="rounded-lg border border-brand-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-100 bg-brand-50 px-4 py-3">
        <h3 className="text-base font-semibold text-brand-900">{titre}</h3>
        <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-brand-600 ring-1 ring-brand-200">
          {nature}
        </span>
      </div>

      {avertissement && <div className="px-4 pt-4">{avertissement}</div>}

      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-brand-500">
              <th className="py-1.5 pr-3 font-medium">Nature du dysfonctionnement</th>
              <th className="px-3 py-1.5 text-right font-medium">Quantité</th>
              <th className="px-3 py-1.5 font-medium">Unité</th>
              <th className="px-3 py-1.5 text-right font-medium">Taux unitaire</th>
              <th className="px-3 py-1.5 text-right font-medium">Montant</th>
              <th className="w-8 py-1.5" />
            </tr>
          </thead>
          <tbody>
            {lignes.map((ligne) => {
              const tauxLigne = tauxEffectifLigne(ligne, taux, parametres);
              const montant = calculerMontantLigneDysfonctionnement(ligne, taux, parametres);
              const tauxCalcule = ligne.origineTaux !== "libre";
              return (
                <tr key={ligne.id} className="border-b border-brand-50 last:border-0">
                  <td className="py-2 pr-3 align-top">
                    {ligne.supprimable ? (
                      <input
                        type="text"
                        value={ligne.nom}
                        onChange={(e) => onModifier(ligne.id, { nom: e.target.value })}
                        placeholder="Nature du dysfonctionnement"
                        className="w-64 rounded border border-brand-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                      />
                    ) : (
                      <div>
                        <p className="max-w-xs text-brand-800">{ligne.nom}</p>
                        {ligne.commentaire && (
                          <p className="mt-0.5 text-xs italic text-brand-400">{ligne.commentaire}</p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right align-top">
                    <NombreCell
                      label={`Quantité — ${ligne.nom || "ligne"}`}
                      valeur={ligne.quantite}
                      onChange={(v) => onModifier(ligne.id, { quantite: v })}
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    {ligne.supprimable ? (
                      <input
                        type="text"
                        value={ligne.unite}
                        onChange={(e) => onModifier(ligne.id, { unite: e.target.value })}
                        placeholder="unité"
                        className="w-20 rounded border border-brand-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                      />
                    ) : (
                      <span className="text-brand-500">{ligne.unite}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right align-top">
                    {tauxCalcule ? (
                      <span
                        title="Taux repris automatiquement des paramètres (étape 1)"
                        className="inline-block rounded bg-brand-50 px-2 py-1 text-brand-600"
                      >
                        {formatMontantPrecis(tauxLigne)}
                      </span>
                    ) : (
                      <NombreCell
                        label={`Taux unitaire — ${ligne.nom || "ligne"}`}
                        step={0.5}
                        valeur={ligne.tauxUnitaire}
                        onChange={(v) => onModifier(ligne.id, { tauxUnitaire: v })}
                      />
                    )}
                  </td>
                  <td className="px-3 py-2 text-right align-top font-medium tabular-nums text-brand-900">
                    {formatMontant(montant)}
                  </td>
                  <td className="py-2 text-center align-top">
                    {ligne.supprimable && (
                      <button
                        type="button"
                        onClick={() => onSupprimer(ligne.id)}
                        aria-label={`Supprimer ${ligne.nom || "cette ligne"}`}
                        className="text-brand-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-brand-200 font-semibold text-brand-900">
              <td className="py-2 pr-3">Sous-total</td>
              <td colSpan={3} />
              <td className="px-3 py-2 text-right tabular-nums">{formatMontant(sousTotal)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="border-t border-brand-100 px-4 py-3">
        <button
          type="button"
          onClick={onAjouter}
          className="inline-flex items-center gap-2 rounded-md border border-brand-300 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 shadow-sm transition hover:bg-brand-50"
        >
          + Ajouter une ligne
        </button>
      </div>
    </section>
  );
}
