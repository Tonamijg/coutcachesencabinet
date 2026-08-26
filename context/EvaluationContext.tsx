"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { creerEtatInitial } from "@/lib/defaultData";
import { chargerEtat, effacerEtat, sauvegarderEtat } from "@/lib/storage";
import {
  Dysfonctionnements,
  EvaluationState,
  Identification,
  LigneDysfonctionnement,
  LigneReleveTemps,
  LigneRisque,
  nouvelleLigneReleveTemps,
  Parametres,
} from "@/lib/types";

type BlocLigne = "sursalaire" | "surconsommation" | "nonProduction" | "nonCreationPotentiel";

interface EvaluationContextValue {
  etat: EvaluationState;
  pret: boolean;
  setIdentification: <K extends keyof Identification>(champ: K, valeur: Identification[K]) => void;
  setParametre: <K extends keyof Parametres>(champ: K, valeur: Parametres[K]) => void;
  ajouterLigneTemps: () => void;
  supprimerLigneTemps: (id: string) => void;
  modifierLigneTemps: (id: string, patch: Partial<LigneReleveTemps>) => void;
  ajouterLigneDysfonctionnement: (bloc: BlocLigne) => void;
  supprimerLigneDysfonctionnement: (bloc: BlocLigne, id: string) => void;
  modifierLigneDysfonctionnement: (
    bloc: BlocLigne,
    id: string,
    patch: Partial<LigneDysfonctionnement>
  ) => void;
  ajouterLigneRisque: () => void;
  supprimerLigneRisque: (id: string) => void;
  modifierLigneRisque: (id: string, patch: Partial<LigneRisque>) => void;
  reinitialiser: () => void;
}

const EvaluationContext = createContext<EvaluationContextValue | null>(null);

export function EvaluationProvider({ children }: { children: React.ReactNode }) {
  const [etat, setEtat] = useState<EvaluationState>(() => creerEtatInitial());
  const [pret, setPret] = useState(false);
  const premierRendu = useRef(true);

  useEffect(() => {
    const sauvegarde = chargerEtat();
    if (sauvegarde) setEtat(sauvegarde);
    setPret(true);
  }, []);

  useEffect(() => {
    if (!pret) return;
    if (premierRendu.current) {
      premierRendu.current = false;
    }
    sauvegarderEtat(etat);
  }, [etat, pret]);

  const setIdentification = useCallback(
    <K extends keyof Identification>(champ: K, valeur: Identification[K]) => {
      setEtat((e) => ({ ...e, identification: { ...e.identification, [champ]: valeur } }));
    },
    []
  );

  const setParametre = useCallback(
    <K extends keyof Parametres>(champ: K, valeur: Parametres[K]) => {
      setEtat((e) => ({ ...e, parametres: { ...e.parametres, [champ]: valeur } }));
    },
    []
  );

  const ajouterLigneTemps = useCallback(() => {
    setEtat((e) => ({ ...e, releveTemps: [...e.releveTemps, nouvelleLigneReleveTemps()] }));
  }, []);

  const supprimerLigneTemps = useCallback((id: string) => {
    setEtat((e) => ({ ...e, releveTemps: e.releveTemps.filter((l) => l.id !== id) }));
  }, []);

  const modifierLigneTemps = useCallback((id: string, patch: Partial<LigneReleveTemps>) => {
    setEtat((e) => ({
      ...e,
      releveTemps: e.releveTemps.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  }, []);

  const ajouterLigneDysfonctionnement = useCallback((bloc: BlocLigne) => {
    setEtat((e) => {
      const nouvelle: LigneDysfonctionnement = {
        id: crypto.randomUUID(),
        nom: "",
        unite: "",
        quantite: null,
        origineTaux: "libre",
        tauxUnitaire: null,
        supprimable: true,
      };
      return {
        ...e,
        dysfonctionnements: {
          ...e.dysfonctionnements,
          [bloc]: [...e.dysfonctionnements[bloc], nouvelle],
        } as Dysfonctionnements,
      };
    });
  }, []);

  const supprimerLigneDysfonctionnement = useCallback((bloc: BlocLigne, id: string) => {
    setEtat((e) => ({
      ...e,
      dysfonctionnements: {
        ...e.dysfonctionnements,
        [bloc]: e.dysfonctionnements[bloc].filter((l) => l.id !== id),
      } as Dysfonctionnements,
    }));
  }, []);

  const modifierLigneDysfonctionnement = useCallback(
    (bloc: BlocLigne, id: string, patch: Partial<LigneDysfonctionnement>) => {
      setEtat((e) => ({
        ...e,
        dysfonctionnements: {
          ...e.dysfonctionnements,
          [bloc]: e.dysfonctionnements[bloc].map((l) => (l.id === id ? { ...l, ...patch } : l)),
        } as Dysfonctionnements,
      }));
    },
    []
  );

  const ajouterLigneRisque = useCallback(() => {
    setEtat((e) => {
      const nouvelle: LigneRisque = {
        id: crypto.randomUUID(),
        nom: "",
        coutUnitaire: null,
        occurrences: null,
        probabilite: null,
        supprimable: true,
      };
      return {
        ...e,
        dysfonctionnements: {
          ...e.dysfonctionnements,
          risques: [...e.dysfonctionnements.risques, nouvelle],
        },
      };
    });
  }, []);

  const supprimerLigneRisque = useCallback((id: string) => {
    setEtat((e) => ({
      ...e,
      dysfonctionnements: {
        ...e.dysfonctionnements,
        risques: e.dysfonctionnements.risques.filter((l) => l.id !== id),
      },
    }));
  }, []);

  const modifierLigneRisque = useCallback((id: string, patch: Partial<LigneRisque>) => {
    setEtat((e) => ({
      ...e,
      dysfonctionnements: {
        ...e.dysfonctionnements,
        risques: e.dysfonctionnements.risques.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      },
    }));
  }, []);

  const reinitialiser = useCallback(() => {
    effacerEtat();
    setEtat(creerEtatInitial());
  }, []);

  const valeur = useMemo<EvaluationContextValue>(
    () => ({
      etat,
      pret,
      setIdentification,
      setParametre,
      ajouterLigneTemps,
      supprimerLigneTemps,
      modifierLigneTemps,
      ajouterLigneDysfonctionnement,
      supprimerLigneDysfonctionnement,
      modifierLigneDysfonctionnement,
      ajouterLigneRisque,
      supprimerLigneRisque,
      modifierLigneRisque,
      reinitialiser,
    }),
    [
      etat,
      pret,
      setIdentification,
      setParametre,
      ajouterLigneTemps,
      supprimerLigneTemps,
      modifierLigneTemps,
      ajouterLigneDysfonctionnement,
      supprimerLigneDysfonctionnement,
      modifierLigneDysfonctionnement,
      ajouterLigneRisque,
      supprimerLigneRisque,
      modifierLigneRisque,
      reinitialiser,
    ]
  );

  return <EvaluationContext.Provider value={valeur}>{children}</EvaluationContext.Provider>;
}

export function useEvaluation(): EvaluationContextValue {
  const ctx = useContext(EvaluationContext);
  if (!ctx) throw new Error("useEvaluation doit être utilisé dans un EvaluationProvider");
  return ctx;
}
