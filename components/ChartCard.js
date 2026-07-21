"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function ChartCard({ titleKey, type = "line", data }) {
  const { t } = useLanguage();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data) return null;

  // Renders a line graph using custom SVGs
  const renderLineChart = () => {
    const labels = data.labels || [];
    const values = data.values || [];
    const maxVal = Math.max(...values, 100);
    const height = 150;
    const width = 450;
    const padding = 20;

    // Map data points to SVG coordinates
    const points = values.map((val, idx) => {
      const x = padding + (idx * (width - padding * 2)) / (labels.length - 1);
      const y = height - padding - (val * (height - padding * 2)) / maxVal;
      return { x, y, val, label: labels[idx] };
    });

    // Create polyline / path coordinates
    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // Closed path for fill gradient
    const fillPath = points.length > 0 
      ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` 
      : '';

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FF7A00" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding + ratio * (height - padding * 2);
            return (
              <line
                key={idx}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="dark:stroke-gray-800"
              />
            );
          })}

          {/* Area fill */}
          {fillPath && <path d={fillPath} fill="url(#chartGradient)" />}

          {/* Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#FF7A00"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Nodes */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? "6.5" : "4.5"}
                className="fill-white dark:fill-gray-900 stroke-primary transition-all duration-150 cursor-pointer"
                strokeWidth="2.5"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              {/* Tooltip on hover */}
              {hoveredIdx === idx && (
                <g>
                  <rect
                    x={p.x - 30}
                    y={p.y - 32}
                    width="60"
                    height="20"
                    rx="6"
                    className="fill-slate-900 dark:fill-white"
                  />
                  <text
                    x={p.x}
                    y={p.y - 18}
                    textAnchor="middle"
                    className="fill-white dark:fill-slate-950 font-bold text-[9px]"
                  >
                    {p.val}
                  </text>
                </g>
              )}
            </g>
          ))}

          {/* X Axis Labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={height - 2}
              textAnchor="middle"
              className="fill-slate-400 dark:fill-gray-500 font-semibold text-[8px]"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  // Renders a bar graph
  const renderBarChart = () => {
    const labels = data.labels || [];
    const values = data.values || [];
    const maxVal = Math.max(...values, 100);
    const height = 150;
    const width = 450;
    const padding = 20;

    const barWidth = 24;
    const barSpacing = (width - padding * 2) / labels.length;

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding + ratio * (height - padding * 2);
            return (
              <line
                key={idx}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="dark:stroke-gray-800"
              />
            );
          })}

          {/* Bars */}
          {values.map((val, idx) => {
            const barHeight = (val * (height - padding * 2)) / maxVal;
            const x = padding + idx * barSpacing + (barSpacing - barWidth) / 2;
            const y = height - padding - barHeight;

            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="6"
                  className={`fill-primary/80 dark:fill-primary-light/80 hover:fill-primary transition-colors cursor-pointer ${
                    hoveredIdx === idx ? 'fill-primary' : ''
                  }`}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
                
                {hoveredIdx === idx && (
                  <g>
                    <rect
                      x={x + barWidth / 2 - 25}
                      y={y - 28}
                      width="50"
                      height="20"
                      rx="6"
                      className="fill-slate-900 dark:fill-white"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 14}
                      textAnchor="middle"
                      className="fill-white dark:fill-slate-950 font-bold text-[9px]"
                    >
                      {val}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* X Axis Labels */}
          {labels.map((lbl, idx) => {
            const x = padding + idx * barSpacing + barSpacing / 2;
            return (
              <text
                key={idx}
                x={x}
                y={height - 2}
                textAnchor="middle"
                className="fill-slate-400 dark:fill-gray-500 font-semibold text-[8px]"
              >
                {lbl}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  // Renders a category pie-ring/donut style list
  const renderDonutChart = () => {
    const labels = data.labels || [];
    const values = data.values || [];
    const colors = data.colors || [];
    const total = values.reduce((sum, v) => sum + v, 0);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
        {/* Ring representation */}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
            <circle
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke="#E2E8F0"
              strokeWidth="4.5"
              className="dark:stroke-gray-800"
            />

            {/* Render segments cumulative */}
            {(() => {
              let cumulativeOffset = 0;
              return values.map((val, idx) => {
                const percentage = (val / total) * 100;
                const strokeDash = `${percentage} ${100 - percentage}`;
                const offset = 100 - cumulativeOffset;
                cumulativeOffset += percentage;

                return (
                  <circle
                    key={idx}
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke={colors[idx] || "#FF7A00"}
                    strokeWidth="4.8"
                    strokeDasharray={strokeDash}
                    strokeDashoffset={offset}
                    className="transition-all duration-300 hover:stroke-[5.5]"
                  />
                );
              });
            })()}
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-charcoal dark:text-white font-heading">
              {total}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">
              Total Items
            </span>
          </div>
        </div>

        {/* Legend list */}
        <div className="flex flex-col gap-2 max-w-[200px] w-full">
          {labels.map((lbl, idx) => {
            const val = values[idx];
            const pct = ((val / total) * 100).toFixed(0);
            return (
              <div key={lbl} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: colors[idx] }}
                  />
                  <span className="font-semibold text-charcoal dark:text-gray-300 truncate">
                    {lbl}
                  </span>
                </div>
                <span className="font-bold text-charcoal-light dark:text-gray-400 pl-4 text-right">
                  {val} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
      <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white mb-5 uppercase tracking-wider">
        {t(titleKey)}
      </h3>

      {type === "line" && renderLineChart()}
      {type === "bar" && renderBarChart()}
      {type === "donut" && renderDonutChart()}
    </div>
  );
}
