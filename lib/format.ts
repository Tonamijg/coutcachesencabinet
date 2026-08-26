// Formatage des nombres pour l'affichage (séparateur de milliers, décimales fixes).

const formatterMonnaie0 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const formatterMonnaie2 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const formatterNombre1 = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const formatterNombre2 = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const formatterPourcentage = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  maximumFractionDigits: 1,
});

/** Montants ronds (totaux, sous-totaux) : 0 décimale. */
export function formatMontant(valeur: number): string {
  if (!Number.isFinite(valeur)) return formatterMonnaie0.format(0);
  return formatterMonnaie0.format(valeur);
}

/** Taux horaires et montants fins : 2 décimales. */
export function formatMontantPrecis(valeur: number): string {
  if (!Number.isFinite(valeur)) return formatterMonnaie2.format(0);
  return formatterMonnaie2.format(valeur);
}

export function formatHeures(valeur: number): string {
  if (!Number.isFinite(valeur)) return "0";
  return `${formatterNombre1.format(valeur)} h`;
}

export function formatNombre2(valeur: number): string {
  if (!Number.isFinite(valeur)) return formatterNombre2.format(0);
  return formatterNombre2.format(valeur);
}

export function formatPourcentage(valeur: number): string {
  if (!Number.isFinite(valeur)) return formatterPourcentage.format(0);
  return formatterPourcentage.format(valeur);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}
