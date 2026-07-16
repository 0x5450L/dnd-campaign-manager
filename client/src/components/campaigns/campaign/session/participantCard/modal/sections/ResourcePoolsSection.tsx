import type { EditorBodyProps } from "@/types/components/participantCard";

export const ResourcePoolsSection = ({ draft }: EditorBodyProps) => {
  const pools = draft.resources ?? [];
  if (pools.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs sm:text-sm uppercase tracking-[0.18em] text-faint">Resources</span>
      <div className="flex flex-wrap items-stretch gap-2.5">
        {pools.map((pool) => (
          <div
            key={pool.key}
            className="flex min-w-36 grow basis-0 flex-col items-center justify-center gap-1 rounded-md border border-rule bg-bg/60 px-3 py-2 font-fantasy"
          >
            <span className="text-center text-xs sm:text-sm uppercase tracking-[0.18em] text-faint">
              {pool.label}
            </span>
            <span className="text-xl font-bold text-ink">
              {pool.remaining}
              <span className="text-base font-normal text-dim"> / {pool.max}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourcePoolsSection;
