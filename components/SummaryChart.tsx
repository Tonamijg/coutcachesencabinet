"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMontant } from "@/lib/format";
import { LigneSynthese } from "@/lib/calculations";

const COULEURS = ["#28436a", "#3a5a85", "#5c7ead", "#8fa9cd", "#b6c8e0", "#152742"];

export function SummaryChart({ composants }: { composants: LigneSynthese[] }) {
  const donnees = composants.map((c) => ({ nom: c.nom, montant: Math.max(0, c.montant) }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={donnees} layout="vertical" margin={{ left: 24, right: 24, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#dbe4f0" />
          <XAxis
            type="number"
            tickFormatter={(v: number) => formatMontant(v)}
            tick={{ fill: "#5c7ead", fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="nom"
            width={160}
            tick={{ fill: "#152742", fontSize: 13 }}
          />
          <Tooltip
            formatter={(value: number) => formatMontant(value)}
            contentStyle={{ borderRadius: 8, borderColor: "#b6c8e0", fontSize: 13 }}
          />
          <Bar dataKey="montant" radius={[0, 4, 4, 0]}>
            {donnees.map((_, index) => (
              <Cell key={index} fill={COULEURS[index % COULEURS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
