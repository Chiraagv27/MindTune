interface LandingSectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  index?: string;
  centered?: boolean;
}

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  index,
  centered = false,
}: LandingSectionHeaderProps) {
  if (centered) {
    return (
      <div className="relative mx-auto mb-10 max-w-3xl text-center md:mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400/90">{eyebrow}</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50 md:text-[2.25rem] md:leading-tight">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 text-base leading-relaxed text-zinc-300 md:text-lg md:leading-8">{description}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative mb-10 w-full md:mb-12">
      <div className="flex items-start justify-between gap-6 md:gap-10">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400/90">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50 md:text-[2.35rem] md:leading-tight">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 max-w-4xl text-base leading-relaxed text-zinc-300 md:text-lg md:leading-8">
              {description}
            </p>
          ) : null}
        </div>
        {index ? (
          <p
            className="landing-section-index shrink-0 select-none font-mono text-[3rem] font-bold leading-none md:text-[4.5rem] lg:text-[5rem]"
            aria-hidden
          >
            {index}
          </p>
        ) : null}
      </div>
    </div>
  );
}
