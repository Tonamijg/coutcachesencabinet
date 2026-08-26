import type { Metadata } from "next";
import { EvaluationProvider } from "@/context/EvaluationContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coûts cachés du retard de transmission des pièces",
  description:
    "Évaluez en euros le coût caché généré par les retards de transmission des pièces comptables (méthode socio-économique Savall/ISEOR).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <EvaluationProvider>{children}</EvaluationProvider>
      </body>
    </html>
  );
}
