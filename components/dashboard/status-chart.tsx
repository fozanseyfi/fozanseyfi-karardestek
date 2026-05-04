"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const STATUS_LABELS: Record<string, string> = {
  draft: "Taslak",
  in_review: "Tamamlandı",
  decided: "Karar Verildi",
  archived: "Arşiv",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "#f59e0b",
  in_review: "#3b82f6",
  decided: "#10b981",
  archived: "#9ca3af",
};

export function StatusChart({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  if (data.length === 0 || data.every((d) => d.count === 0)) {
    return (
      <div className="text-muted-foreground flex h-56 items-center justify-center text-sm">
        Henüz karşılaştırma yok.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: STATUS_LABELS[d.status] ?? d.status,
    value: d.count,
    color: STATUS_COLORS[d.status] ?? "#9ca3af",
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
