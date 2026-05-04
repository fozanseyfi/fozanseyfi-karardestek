"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import type { FirmStats } from "@/lib/scoring";

export function ScoreChart({ firms }: { firms: FirmStats[] }) {
  const data = firms.map((f) => ({ name: f.firmName, skor: f.score, recommendation: f.recommendation }));
  const colorOf = (rec: FirmStats["recommendation"]) =>
    rec === "good"
      ? "#10b981"
      : rec === "warning"
        ? "#f59e0b"
        : rec === "danger"
          ? "#ef4444"
          : "#94a3b8";

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tickCount={6} fontSize={12} />
          <YAxis dataKey="name" type="category" width={140} fontSize={12} />
          <Tooltip
            formatter={(v) => [typeof v === "number" ? v.toFixed(1) : "—", "Skor"]}
            cursor={{ fill: "rgba(148,163,184,0.1)" }}
          />
          <Bar dataKey="skor" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={colorOf(d.recommendation as FirmStats["recommendation"])} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
