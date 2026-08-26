"use client";

import { StepShell } from "@/components/StepShell";
import { Callout } from "@/components/Callout";
import { DysfunctionBlock } from "@/components/DysfunctionBlock";
import { RisqueBlock } from "@/components/RisqueBlock";
import { useEvaluation } from "@/context/EvaluationContext";
import { calculerTauxValorisation } from "@/lib/calculations";

export default function PageDysfonctionnements() {
  const {
    etat,
    pret,
    ajouterLigneDysfonctionnement,
    supprimerLigneDysfonctionnement,
    modifierLigneDysfonctionnement,
    ajouterLigneRisque,
    supprimerLigneRisque,
    modifierLigneRisque,
  } = useEvaluation();

  if (!pret) return null;

  const { parametres, dysfonctionnements } = etat;
  const taux = calculerTauxValorisation(parametres);

  return (
    <StepShell
      etape={3}
      titre="Autres dysfonctionnements"
      objet="Ce sont les composants qui ne relèvent pas du relevé de temps : recensez les faits observés sur l'exercice pour le périmètre évalué — heures supplémentaires, renforts, déplacements, missions non développées et risques déclaratifs."
      precedent={{ href: "/releve-temps", label: "Relevé de temps" }}
      suivant={{ href: "/synthese" }}
    >
      <DysfunctionBlock
        titre="Sursalaire"
        nature="Décaissement réel — valorisation au coût effectif"
        lignes={dysfonctionnements.sursalaire}
        taux={taux}
        parametres={parametres}
        onAjouter={() => ajouterLigneDysfonctionnement("sursalaire")}
        onSupprimer={(id) => supprimerLigneDysfonctionnement("sursalaire", id)}
        onModifier={(id, patch) => modifierLigneDysfonctionnement("sursalaire", id, patch)}
      />

      <DysfunctionBlock
        titre="Surconsommation"
        nature="Décaissement réel — valorisation au coût effectif"
        lignes={dysfonctionnements.surconsommation}
        taux={taux}
        parametres={parametres}
        onAjouter={() => ajouterLigneDysfonctionnement("surconsommation")}
        onSupprimer={(id) => supprimerLigneDysfonctionnement("surconsommation", id)}
        onModifier={(id, patch) => modifierLigneDysfonctionnement("surconsommation", id, patch)}
      />

      <DysfunctionBlock
        titre="Non-production"
        nature="Coût d'opportunité — valorisation à la contribution horaire"
        lignes={dysfonctionnements.nonProduction}
        taux={taux}
        parametres={parametres}
        onAjouter={() => ajouterLigneDysfonctionnement("nonProduction")}
        onSupprimer={(id) => supprimerLigneDysfonctionnement("nonProduction", id)}
        onModifier={(id, patch) => modifierLigneDysfonctionnement("nonProduction", id, patch)}
      />

      <DysfunctionBlock
        titre="Non-création de potentiel"
        nature="Coût d'opportunité différé — à documenter dossier par dossier"
        lignes={dysfonctionnements.nonCreationPotentiel}
        taux={taux}
        parametres={parametres}
        avertissement={
          <Callout variante="avertissement" titre="Le composant le plus fragile de l'évaluation">
            Il repose sur des missions hypothétiques. Documentez-le dossier par dossier, ou laissez-le
            à zéro et signalez-le comme non évalué dans votre restitution.
          </Callout>
        }
        onAjouter={() => ajouterLigneDysfonctionnement("nonCreationPotentiel")}
        onSupprimer={(id) => supprimerLigneDysfonctionnement("nonCreationPotentiel", id)}
        onModifier={(id, patch) => modifierLigneDysfonctionnement("nonCreationPotentiel", id, patch)}
      />

      <RisqueBlock
        lignes={dysfonctionnements.risques}
        onAjouter={ajouterLigneRisque}
        onSupprimer={supprimerLigneRisque}
        onModifier={modifierLigneRisque}
      />

      <Callout>
        Les lignes proposées correspondent aux faits les plus courants ; ajoutez vos propres lignes
        dans chaque bloc si votre cabinet observe d&apos;autres dysfonctionnements du même type.
      </Callout>
    </StepShell>
  );
}
