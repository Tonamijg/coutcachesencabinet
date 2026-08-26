import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  formatDate,
  formatMontant as formatMontantBrut,
  formatMontantPrecis as formatMontantPrecisBrut,
  formatNombre2 as formatNombre2Brut,
  formatPourcentage as formatPourcentageBrut,
} from "@/lib/format";
import { LecturesDerivees, Synthese } from "@/lib/calculations";
import { genererLectureQualitative } from "@/lib/interpretation";
import { Identification, Parametres, TauxValorisation } from "@/lib/types";

// Les polices standard des PDF (Helvetica) ne portent pas le glyphe de l'espace
// fine insécable (U+202F) utilisée par Intl pour séparer les milliers en fr-FR :
// sans ce remplacement, les montants s'affichent avec un caractère erroné
// (ex. « 1/650/000 € » au lieu de « 1 650 000 € »).
const sansEspaceFine = (texte: string) => texte.replace(/[\u00A0\u202F]/g, " ");
const formatMontant = (v: number) => sansEspaceFine(formatMontantBrut(v));
const formatMontantPrecis = (v: number) => sansEspaceFine(formatMontantPrecisBrut(v));
const formatNombre2 = (v: number) => sansEspaceFine(formatNombre2Brut(v));
const formatPourcentage = (v: number) => sansEspaceFine(formatPourcentageBrut(v));

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#152742",
  },
  titre: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#152742",
  },
  sousTitre: {
    fontSize: 10,
    color: "#5c7ead",
    marginTop: 4,
  },
  dateGeneration: {
    fontSize: 9,
    color: "#5c7ead",
    marginTop: 10,
  },
  sectionTitre: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#152742",
    marginTop: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#b6c8e0",
    paddingBottom: 4,
  },
  ligneParam: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eef2f8",
  },
  paramLabel: { color: "#28436a", width: "70%" },
  paramValeur: { fontFamily: "Helvetica-Bold", width: "30%", textAlign: "right" },
  table: { marginTop: 4 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#eef2f8",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eef2f8",
  },
  tableRowTotal: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 4,
    backgroundColor: "#152742",
    marginTop: 2,
  },
  colComposant: { width: "34%" },
  colNature: { width: "30%" },
  colMontant: { width: "20%", textAlign: "right" },
  colPart: { width: "16%", textAlign: "right" },
  headerText: { fontFamily: "Helvetica-Bold", fontSize: 9, color: "#28436a" },
  cellText: { fontSize: 9.5, color: "#152742" },
  totalText: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  totalBloc: {
    marginTop: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#8fa9cd",
    borderRadius: 4,
    alignItems: "center",
  },
  totalLabel: { fontSize: 10, color: "#5c7ead" },
  totalMontant: { fontSize: 26, fontFamily: "Helvetica-Bold", color: "#152742", marginTop: 4 },
  indicateurGrille: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  indicateurCard: {
    width: "48%",
    marginRight: "2%",
    marginBottom: 8,
    padding: 8,
    borderWidth: 0.5,
    borderColor: "#dbe4f0",
    borderRadius: 3,
  },
  indicateurLabel: { fontSize: 8.5, color: "#5c7ead" },
  indicateurValeur: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#152742", marginTop: 2 },
  miseEnGarde: {
    marginTop: 18,
    padding: 10,
    backgroundColor: "#fffbeb",
    borderWidth: 0.5,
    borderColor: "#fcd34d",
    borderRadius: 4,
  },
  miseEnGardeTitre: { fontFamily: "Helvetica-Bold", fontSize: 9.5, marginBottom: 4, color: "#78350f" },
  miseEnGardeTexte: { fontSize: 9, lineHeight: 1.4, color: "#78350f" },
  puceLigne: { flexDirection: "row", marginBottom: 4 },
  pucePoint: { width: 10, fontSize: 9.5, color: "#28436a" },
  puceTexte: { flex: 1, fontSize: 9.5, lineHeight: 1.4, color: "#152742" },
  piedDePage: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 7.5,
    color: "#8fa9cd",
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#dbe4f0",
    paddingTop: 6,
  },
});

const MISE_EN_GARDE =
  "Le montant obtenu constitue un ordre de grandeur documenté et non une mesure comptable. Les composants relevant du coût d'opportunité reposent sur une contribution horaire moyenne qui lisse les écarts entre missions, et le composant risques suppose des probabilités estimées. La valeur de l'exercice tient moins à l'exactitude du montant qu'au fait de rendre visible et discutable une charge jusque-là absente de tout compte.";

interface FicheDeterminationProps {
  identification: Identification;
  parametres: Parametres;
  taux: TauxValorisation;
  synthese: Synthese;
  lectures: LecturesDerivees;
  dateGeneration: Date;
}

function ligneParametre(label: string, valeur: string) {
  return (
    <View style={styles.ligneParam} key={label}>
      <Text style={styles.paramLabel}>{label}</Text>
      <Text style={styles.paramValeur}>{valeur}</Text>
    </View>
  );
}

export function FicheDetermination({
  identification,
  parametres,
  taux,
  synthese,
  lectures,
  dateGeneration,
}: FicheDeterminationProps) {
  const p = parametres;
  const lectureQualitative = genererLectureQualitative(synthese, lectures).map(sansEspaceFine);
  return (
    <Document title="Évaluation des coûts cachés du retard de transmission des pièces comptables">
      <Page size="A4" style={styles.page}>
        <Text style={styles.titre}>
          Évaluation des coûts cachés du retard de transmission des pièces comptables
        </Text>
        <Text style={styles.sousTitre}>Fiche de détermination</Text>
        <Text style={styles.dateGeneration}>
          {identification.cabinet} — Établie par {identification.nomUtilisateur}
          {"  ·  "}
          Générée le {formatDate(dateGeneration)}
        </Text>

        <Text style={styles.sectionTitre}>Hypothèses structurantes de l&apos;évaluation</Text>
        <View>
          {ligneParametre("Chiffre d'affaires annuel", formatMontant(p.chiffreAffaires ?? 0))}
          {ligneParametre("Charges variables annuelles", formatMontant(p.chargesVariables ?? 0))}
          {ligneParametre("Effectif productif", `${p.effectifProductif ?? 0} pers.`)}
          {ligneParametre(
            "Heures de travail attendues par collaborateur",
            `${p.heuresParCollaborateur ?? 0} h/an`
          )}
          {ligneParametre("Semaines travaillées par an", `${p.semainesTravaillees ?? 0} sem.`)}
          {ligneParametre(
            "Coût horaire chargé — collaborateur",
            `${formatMontantPrecis(p.coutHoraireCollaborateur ?? 0)}/h`
          )}
          {ligneParametre(
            "Coût horaire chargé — chef de mission",
            `${formatMontantPrecis(p.coutHoraireChefMission ?? 0)}/h`
          )}
          {ligneParametre(
            "Taux horaire moyen facturé",
            `${formatMontantPrecis(p.tauxHoraireFacture ?? 0)}/h`
          )}
          {ligneParametre("Nombre de dossiers du périmètre évalué", `${p.nombreDossiers ?? 0} doss.`)}
          {ligneParametre(
            "Contribution horaire à la marge sur coûts variables (valeur pivot)",
            `${formatMontantPrecis(taux.contributionHoraire)}/h`
          )}
        </View>

        <Text style={styles.sectionTitre}>Synthèse par composant</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colComposant]}>Composant</Text>
            <Text style={[styles.headerText, styles.colNature]}>Nature</Text>
            <Text style={[styles.headerText, styles.colMontant]}>Montant</Text>
            <Text style={[styles.headerText, styles.colPart]}>% du total</Text>
          </View>
          {synthese.composants.map((c) => (
            <View style={styles.tableRow} key={c.cle}>
              <Text style={[styles.cellText, styles.colComposant]}>{c.nom}</Text>
              <Text style={[styles.cellText, styles.colNature]}>{c.nature}</Text>
              <Text style={[styles.cellText, styles.colMontant]}>{formatMontant(c.montant)}</Text>
              <Text style={[styles.cellText, styles.colPart]}>{formatPourcentage(c.part)}</Text>
            </View>
          ))}
          <View style={styles.tableRowTotal}>
            <Text style={[styles.totalText, styles.colComposant]}>TOTAL DU COÛT CACHÉ ÉVALUÉ</Text>
            <Text style={[styles.totalText, styles.colNature]} />
            <Text style={[styles.totalText, styles.colMontant]}>{formatMontant(synthese.total)}</Text>
            <Text style={[styles.totalText, styles.colPart]}>100 %</Text>
          </View>
        </View>

        <View style={styles.totalBloc}>
          <Text style={styles.totalLabel}>Coût caché total évalué, par an</Text>
          <Text style={styles.totalMontant}>{formatMontant(synthese.total)}</Text>
        </View>

        <Text style={styles.sectionTitre}>Lectures dérivées</Text>
        <View style={styles.indicateurGrille}>
          <IndicateurPdf label="Coût caché par collaborateur" valeur={formatMontant(lectures.coutParCollaborateur)} />
          <IndicateurPdf
            label="Coût caché par dossier du périmètre"
            valeur={formatMontantPrecis(lectures.coutParDossier)}
          />
          <IndicateurPdf
            label="Part du coût en décaissement réel"
            valeur={formatPourcentage(lectures.partDecaissementReel)}
          />
          <IndicateurPdf
            label="Part du coût en coût d'opportunité"
            valeur={formatPourcentage(lectures.partCoutOpportunite)}
          />
          <IndicateurPdf label="Part du coût probabilisé" valeur={formatPourcentage(lectures.partCoutProbabilise)} />
          <IndicateurPdf
            label="Équivalent temps plein mobilisé"
            valeur={`${formatNombre2(lectures.equivalentTempsPlein)} ETP`}
          />
          <IndicateurPdf
            label="Coût caché rapporté à la marge sur coûts variables"
            valeur={formatPourcentage(lectures.coutRapporteMCV)}
          />
        </View>

        {lectureQualitative.length > 0 && (
          <>
            <Text style={styles.sectionTitre}>Lecture qualitative</Text>
            <View>
              {lectureQualitative.map((phrase) => (
                <View style={styles.puceLigne} key={phrase}>
                  <Text style={styles.pucePoint}>•</Text>
                  <Text style={styles.puceTexte}>{phrase}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.miseEnGarde}>
          <Text style={styles.miseEnGardeTitre}>Mise en garde méthodologique</Text>
          <Text style={styles.miseEnGardeTexte}>{MISE_EN_GARDE}</Text>
        </View>

        <Text style={styles.piedDePage}>
          Évaluation réalisée selon une transposition de la démarche socio-économique développée
          par Henri Savall et l&apos;ISEOR à la mission d&apos;assistance comptable.
        </Text>
      </Page>
    </Document>
  );
}

function IndicateurPdf({ label, valeur }: { label: string; valeur: string }) {
  return (
    <View style={styles.indicateurCard}>
      <Text style={styles.indicateurLabel}>{label}</Text>
      <Text style={styles.indicateurValeur}>{valeur}</Text>
    </View>
  );
}
