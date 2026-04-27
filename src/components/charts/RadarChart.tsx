'use client';

import React from 'react';
import { ConceptStrengths } from '@/lib/progressionService';

interface RadarChartProps {
  scores: ConceptStrengths;
  size?: number;
}

export function RadarChart({ scores, size = 240 }: RadarChartProps) {
  const labels = [
    { key: 'budgeting', label: 'Budget' },
    { key: 'saving', label: 'Saving' },
    { key: 'investing', label: 'Investing' },
    { key: 'credit', label: 'Credit' },
    { key: 'taxes', label: 'Taxes' },
    { key: 'spending', label: 'Spending' },
  ];

  const center = size / 2;
  const radius = (size / 2) * 0.75;
  const totalAxes = labels.length;

  const getPoint = (score: number, index: number, radiusOverride?: number) => {
    const r = radiusOverride !== undefined ? radiusOverride : (radius * (score / 100));
    const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const points = labels.map((axis, i) => {
    const rawScore = scores[axis.key as keyof ConceptStrengths] || 0;
    const score = Math.max(5, rawScore); // Min floor for visibility
    const { x, y } = getPoint(score, i);
    return `${x},${y}`;
  }).join(' ');

  const gridPoints = [20, 40, 60, 80, 100].map(level => {
    return labels.map((_, i) => {
      const { x, y } = getPoint(level, i, (radius * (level / 100)));
      return `${x},${y}`;
    }).join(' ');
  });

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grids */}
        {gridPoints.map((gp, i) => (
          <polygon
            key={i}
            points={gp}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray={i === 4 ? "0" : "2 2"}
          />
        ))}

        {/* Axis Lines */}
        {labels.map((_, i) => {
          const { x, y } = getPoint(100, i, radius);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Polygon */}
        <polygon
          points={points}
          fill="rgba(46, 125, 90, 0.15)"
          stroke="#2E7D5A"
          strokeWidth="2"
          className="transition-all duration-1000 ease-out"
        />

        {/* Points */}
        {labels.map((axis, i) => {
          const score = Math.max(5, scores[axis.key as keyof ConceptStrengths] || 0);
          const { x, y } = getPoint(score, i);
          return <circle key={i} cx={x} cy={y} r="3" fill="#2E7D5A" />;
        })}

        {/* Labels */}
        {labels.map((axis, i) => {
          const { x, y } = getPoint(100, i, radius + 20);
          return (
            <text
              key={i}
              x={x}
              y={y}
              fontSize="10"
              fontWeight="800"
              textAnchor="middle"
              alignmentBaseline="middle"
              className="fill-slate-400 uppercase tracking-tighter"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
