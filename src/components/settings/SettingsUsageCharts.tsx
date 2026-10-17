'use client';

import { useMemo, useState } from 'react';
import { Activity, Cpu, Sparkles } from 'lucide-react';

import type { UserAnalytics } from '@/lib/client/userProfile';
import { modePillClass } from '@/lib/modeStyles';
import type { Mode } from '@/lib/types';

const MODE_BAR_CLASS: Record<string, string> = {
  Developer: 'bg-sky-500',
  Beginner: 'bg-sky-400',
  'Step-by-step': 'bg-amber-500',
};

function modeKeyFromLabel(label: string): Mode {
  const lower = label.toLowerCase();
  if (lower === 'beginner') return 'beginner';
  if (lower.startsWith('step')) return 'step-by-step';
  return 'developer';
}

function OptimizationLineChart({ points }: { points: UserAnalytics['dailyRuns'] }) {
  const width = 320;
  const height = 96;
  const padX = 6;
  const padY = 10;
  const max = Math.max(1, ...points.map((p) => p.count));
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const [hovered, setHovered] = useState<number | null>(null);

  const coords = useMemo(
    () =>
      points.map((p, i) => {
        const x = padX + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
        const y = padY + innerH - (p.count / max) * innerH;
        return { x, y, count: p.count, label: p.label, dateKey: p.dateKey };
      }),
    [points, innerW, innerH, max, padX, padY],
  );

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
  const area = `${line} L ${coords[coords.length - 1]?.x ?? padX} ${height - padY} L ${coords[0]?.x ?? padX} ${height - padY} Z`;

  const active = hovered !== null ? coords[hovered] : null;

  return (
    <div className="profile-chart-wrap relative">
      {active ? (
        <div
          className="profile-chart-tooltip pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap"
          style={{
            left: `${((active.x / width) * 100).toFixed(2)}%`,
            top: `${((active.y / height) * 100).toFixed(2)}%`,
            marginTop: '-0.35rem',
          }}
        >
          <p className="font-semibold text-zinc-100">{active.label}</p>
          <p className="text-sky-300">
            {active.count} {active.count === 1 ? 'prompt' : 'prompts'}
          </p>
        </div>
      ) : null}

      <svg viewBox={`0 0 ${width} ${height}`} className="h-[6rem] w-full">
        <defs>
          <linearGradient id="profile-chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.35)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={width - padX}
            y1={padY + innerH * t}
            y2={padY + innerH * t}
            stroke="rgba(63, 63, 70, 0.45)"
            strokeWidth="1"
          />
        ))}
        <path d={area} fill="url(#profile-chart-fill)" />
        <path d={line} fill="none" stroke="rgba(56, 189, 248, 0.95)" strokeWidth="2" strokeLinejoin="round" />
        {coords.map((c, i) => (
          <g key={c.dateKey}>
            <circle
              cx={c.x}
              cy={c.y}
              r={12}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
            />
            <circle
              cx={c.x}
              cy={c.y}
              r={hovered === i ? 4 : c.count > 0 ? 2.5 : 0}
              fill={hovered === i ? '#7dd3fc' : '#38bdf8'}
              className="pointer-events-none transition-[r]"
            />
          </g>
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export function SettingsUsageCharts({ stats }: { stats: UserAnalytics }) {
  const topProvider = stats.providerBreakdown[0];
  const favoriteModeKey = stats.favoriteMode ? modeKeyFromLabel(stats.favoriteMode) : 'developer';

  return (
    <section className="profile-telemetry">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-sky-400" strokeWidth={2} />
        <h2 className="profile-section-title font-heading text-lg font-semibold text-zinc-100">Usage</h2>
      </div>

      <div className="profile-telemetry-grid">
        <div className="profile-telemetry-card">
          <p className="profile-telemetry-label">Optimizations</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[1.65rem] font-semibold tracking-tight text-zinc-50">{stats.total.toLocaleString()}</span>
            {stats.growthPercent !== null ? (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  stats.growthPercent >= 0
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-rose-500/15 text-rose-300'
                }`}
              >
                {stats.growthPercent >= 0 ? '+' : ''}
                {stats.growthPercent}% vs prior week
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-zinc-500">Hover the chart for prompts per day</p>
          <div className="mt-3">
            <OptimizationLineChart points={stats.dailyRuns} />
          </div>
        </div>

        <div className="profile-telemetry-card">
          <p className="profile-telemetry-label">Favorite mode</p>
          {stats.favoriteMode ? (
            <span className={`mt-2 inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${modePillClass(favoriteModeKey)}`}>
              {stats.favoriteMode}
            </span>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No runs yet</p>
          )}
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">Preference mix</p>
          <div className="mt-2 space-y-2">
            {stats.modeBreakdown.length === 0 ? (
              <p className="text-xs text-zinc-500">Tune a prompt to see mode breakdown.</p>
            ) : (
              stats.modeBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex justify-between text-[11px] text-zinc-400">
                    <span>{item.label}</span>
                    <span>{item.percent}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={`h-full rounded-full ${MODE_BAR_CLASS[item.label] ?? 'bg-sky-500'}`}
                      style={{ width: `${Math.max(item.percent, 4)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="profile-telemetry-card">
          <p className="profile-telemetry-label">Most used provider</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="profile-provider-icon">
              <Cpu size={16} />
            </span>
            <span className="font-heading text-lg font-semibold text-zinc-100">
              {stats.favoriteProvider ?? 'None yet'}
            </span>
          </div>
          {topProvider ? (
            <>
              <p className="mt-3 text-xs text-zinc-500">
                {topProvider.count} of {stats.total} runs ({topProvider.percent}%)
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-600 to-sky-400"
                  style={{ width: `${Math.max(topProvider.percent, 6)}%` }}
                />
              </div>
              <div className="mt-3 space-y-1">
                {stats.providerBreakdown.slice(0, 3).map((p) => (
                  <div key={p.label} className="flex justify-between text-[11px] text-zinc-500">
                    <span>{p.label}</span>
                    <span>{p.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-2 text-xs text-zinc-500">Provider stats appear after your first optimization.</p>
          )}
          <p className="mt-4 inline-flex items-center gap-1 text-[10px] text-zinc-600">
            <Sparkles size={11} />
            From your optimization history
          </p>
        </div>
      </div>
    </section>
  );
}
