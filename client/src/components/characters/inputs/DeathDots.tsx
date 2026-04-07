type DeathDotsProps = {
  count: number;
  max: number;
  type: "success" | "fail";
  field: string;
  onUpdate: (field: string, value: number) => void;
};

export const DeathDots = ({ count, max, type, field, onUpdate }: DeathDotsProps) => (
  <div className="flex gap-1">
    {Array.from({ length: max }, (_, i) => (
      <div
        key={i}
        onClick={() => onUpdate(field, i < count ? i : i + 1)}
        className={`cs-death-dot ${i < count ? type : ""}`}
      />
    ))}
  </div>
);
