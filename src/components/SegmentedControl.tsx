import { modeSegmentUi, normalizeAppMode } from '@/lib/modeStyles';
import type { Mode } from '@/lib/types';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

function isAppMode(value: string): value is Mode {
  return value === 'developer' || value === 'beginner' || value === 'step-by-step';
}

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<SegmentedOption<T>>;
  disabled?: boolean;
  groupClassName?: string;
}

export function SegmentedControl<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled,
  groupClassName,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
      ) : null}
      <div
        className={[
          'inline-flex max-w-full flex-wrap gap-1 rounded-2xl border border-white/6 bg-white/3 p-1.5 backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-950/40',
          groupClassName ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {options.map((o) => {
          const active = o.value === value;
          const modeUi = isAppMode(o.value) ? modeSegmentUi(normalizeAppMode(o.value)) : null;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              disabled={disabled}
              className={[
                'h-10 shrink-0 rounded-xl px-4 text-sm font-semibold transition-all duration-200',
                active && modeUi
                  ? modeUi.active
                  : active
                    ? 'bg-sky-500/18 text-sky-100 ring-1 ring-sky-500/45 shadow-sm shadow-sky-950/20'
                    : 'text-zinc-500 dark:text-zinc-500',
                !active && modeUi ? modeUi.hover : '',
                !active && !modeUi ? 'hover:text-zinc-300 hover:bg-white/5 dark:hover:text-zinc-300' : '',
                disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
              ].join(' ')}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
