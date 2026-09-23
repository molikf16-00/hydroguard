import { useState } from "react";
import type { TrendPoint } from "../types";
export function LiveTrend({ points }: { points: TrendPoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  if (!points.length)
    return (
      <div className="empty-chart">
        A trend will appear after valid live data is received.
      </div>
    );
  const width = 650,
    height = 160,
    left = 28,
    top = 8,
    bottom = 135;
  const x = (i: number) =>
    left + (i / Math.max(1, points.length - 1)) * (width - left - 10);
  const y = (n: number) => bottom - (n / 100) * (bottom - top);
  const line = points
    .map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.riskScore)}`)
    .join(" ");
  const selected =
    active === null ? points.length - 1 : Math.min(active, points.length - 1);
  return (
    <div className="trend">
      <div className="trend-reading">
        <strong>
          {points[selected].riskScore}
          <small>/100</small>
        </strong>
        <span>{points[selected].time} IST · rolling score</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Risk score history from live model data"
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#258777" stopOpacity=".18" />
            <stop offset="100%" stopColor="#258777" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 30, 60, 80, 100].map((n) => (
          <g key={n}>
            <line
              x1={left}
              x2={width}
              y1={y(n)}
              y2={y(n)}
              stroke="#dfe8e5"
              strokeDasharray={n === 0 ? "" : "3 5"}
            />
            <text x="0" y={y(n) + 4} fontSize="10" fill="#80918c">
              {n}
            </text>
          </g>
        ))}
        <path
          d={`${line} L${x(points.length - 1)},${bottom} L${left},${bottom} Z`}
          fill="url(#trend-fill)"
        />
        <path d={line} fill="none" stroke="#258777" strokeWidth="2.5" />
        {points.map((p, i) => (
          <g key={p.timestampIso ?? i}>
            <circle
              cx={x(i)}
              cy={y(p.riskScore)}
              r={selected === i ? 4 : 2}
              fill="#258777"
            />
            <rect
              x={x(i) - 10}
              y="0"
              width="20"
              height={bottom}
              fill="transparent"
              onMouseEnter={() => setActive(i)}
            />
          </g>
        ))}
        {[0, Math.floor((points.length - 1) / 2), points.length - 1].map(
          (i, n) => (
            <text
              key={n}
              x={x(i)}
              y="155"
              fontSize="10"
              textAnchor={n === 0 ? "start" : n === 2 ? "end" : "middle"}
              fill="#80918c"
            >
              {points[i].time}
            </text>
          ),
        )}
      </svg>
      <label className="sr-only" htmlFor="trend-hour">
        Inspect history hour
      </label>
      <input
        id="trend-hour"
        aria-label="Inspect history hour"
        type="range"
        min="0"
        max={points.length - 1}
        value={selected}
        onChange={(e) => setActive(+e.target.value)}
      />
    </div>
  );
}
