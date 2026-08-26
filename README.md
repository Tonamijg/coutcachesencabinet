# Coûts cachés du retard de transmission des pièces comptables

Application web transposant en parcours guidé l'instrument socio-économique (méthode
Savall / ISEOR) d'évaluation du coût caché généré, dans un cabinet d'expertise comptable, par
les retards de transmission des pièces comptables par les clients.

L'utilisateur avance à travers 5 étapes séquentielles (mode d'emploi, paramètres, relevé de
temps, dysfonctionnements, synthèse), saisit ses données de gestion, et obtient un montant
total documenté, une décomposition par composant, des indicateurs dérivés, et une fiche de
détermination exportable en PDF.

## Stack technique

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** pour le style
- **Recharts** pour la répartition graphique des composants
- **@react-pdf/renderer** pour générer la fiche de détermination, entièrement côté client
  (aucune fonction serverless requise pour l'export)
- Aucune base de données : tout le calcul se fait en mémoire (React Context), avec
  persistance locale du parcours en cours via `localStorage` pour ne pas perdre la saisie en
  cas de fermeture accidentelle de l'onglet
- Aucune authentification, aucun tracking analytics tiers, aucune donnée envoyée à un serveur

## Lancer le projet en local

Prérequis : Node.js 18.18 ou supérieur.

```bash
npm install
npm run dev
```

L'application est servie sur [http://localhost:3000](http://localhost:3000).

Autres scripts disponibles :

```bash
npm run build   # build de production
npm run start   # sert le build de production
npm run lint    # vérification ESLint
```

## Déployer sur Vercel

### Option 1 — via l'interface Vercel

1. Poussez ce dépôt sur GitHub (ou GitLab/Bitbucket).
2. Sur [vercel.com](https://vercel.com), cliquez sur **Add New → Project** et importez le
   dépôt.
3. Vercel détecte automatiquement Next.js : aucune configuration supplémentaire n'est
   nécessaire (build command `next build`, output géré automatiquement).
4. Déployez. Aucune variable d'environnement n'est requise pour la V1.

### Option 2 — via la CLI

```bash
npm install -g vercel
vercel        # déploiement de prévisualisation
vercel --prod # déploiement en production
```

## Structure du projet

```
app/
  page.tsx                    Étape 0 — Mode d'emploi (accueil)
  parametres/page.tsx         Étape 1 — Paramètres de gestion du cabinet
  releve-temps/page.tsx       Étape 2 — Relevé de temps (relance / reprise)
  dysfonctionnements/page.tsx Étape 3 — Autres dysfonctionnements
  synthese/page.tsx           Étape 4 — Synthèse et export PDF
components/                   Composants d'interface réutilisables
components/pdf/               Document PDF (@react-pdf/renderer)
context/EvaluationContext.tsx État global du parcours + persistance localStorage
lib/
  types.ts                    Modèle de données de l'évaluation
  calculations.ts             Formules de calcul (transposition du classeur Excel source)
  defaultData.ts               Structures initiales (lignes pré-nommées des dysfonctionnements)
  format.ts                    Formatage des nombres et montants (fr-FR)
  storage.ts                   Lecture/écriture localStorage
```

## Principe de calcul

Les formules reproduisent celles du classeur Excel source :

- **Contribution horaire à la marge sur coûts variables** = (Chiffre d'affaires − Charges
  variables) ÷ (Effectif productif × Heures par collaborateur). C'est la valeur pivot : elle
  sert à valoriser tous les coûts d'opportunité de l'évaluation.
- Les **décaissements réels** (Sursalaire, Surconsommation) se valorisent à leur coût
  effectif.
- Les **coûts d'opportunité** (Surtemps, Non-production, Non-création de potentiel) se
  valorisent à la contribution horaire.
- Les **Risques** se valorisent par Coût unitaire × Occurrences/an × Probabilité.

Aucune valeur d'exemple n'est pré-remplie : l'utilisateur doit saisir ses propres données de
gestion à chaque étape.

## Évolution possible : suivi trimestriel des indicateurs

Le classeur source comporte une feuille « 6. Indicateurs » dédiée au suivi trimestriel
(T1 à T4) de trois indicateurs de maîtrise de la collecte, permettant de vérifier dans le
temps que les mesures correctives produisent leurs effets. Ce fonctionnement correspond à un
usage récurrent de pilotage plutôt qu'à une évaluation ponctuelle : il suppose de conserver
un historique de mesures dans le temps, donc probablement une base de données et un compte
utilisateur, ce qui dépasse le périmètre de cette V1. Cette fonctionnalité n'est donc pas
développée ici, mais constitue une piste d'évolution naturelle pour une V2.

## Confidentialité

Aucune donnée personnelle n'est collectée. Toute la saisie reste dans le navigateur de
l'utilisateur (React state + `localStorage`) ; rien n'est envoyé à un serveur, y compris lors
de la génération du PDF, qui s'effectue entièrement côté client.
