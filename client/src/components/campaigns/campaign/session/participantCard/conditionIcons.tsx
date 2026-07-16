import type { ComponentType } from "react";
import type { ConditionName } from "@/types/conditions";

type IconProps = {
  className?: string;
};

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Blinded = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const Charmed = ({ className }: IconProps) => (
  <svg {...baseProps} className={className} fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const Deafened = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <path d="M6 18.5a3.5 3.5 0 0 0 7 0c0-1.57.92-2.52 2.04-3.46" />
    <path d="M6 8.5c0-.83.2-1.61.54-2.3" />
    <path d="M8.34 4.34a6.5 6.5 0 0 1 10.95 4.16c0 1.81-.61 3.13-1.83 4.3" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const Exhaustion = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <rect x="2" y="8" width="17" height="8" rx="1.5" />
    <line x1="21" y1="11" x2="21" y2="13" />
    <rect x="4" y="10" width="3" height="4" fill="currentColor" stroke="none" />
  </svg>
);

const Frightened = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20" />
    <circle cx="9" cy="11" r="2.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="11" r="2.2" fill="currentColor" stroke="none" />
    <ellipse cx="12" cy="17" rx="1" ry="0.8" fill="currentColor" stroke="none" />
  </svg>
);

const Grappled = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <circle cx="7" cy="5" r="2" />
    <line x1="7" y1="7" x2="5" y2="14" />
    <path d="M8 7.5 L10.5 9 L15 8" />
    <path d="M6.5 10 L9 12.5 L13 14" />
    <line x1="5" y1="14" x2="2" y2="22" />
    <line x1="5" y1="14" x2="5" y2="22" />
    <circle cx="17" cy="5" r="2" />
    <line x1="17" y1="7" x2="19" y2="14" />
    <path d="M16 7.5 L13.5 9 L9 8" />
    <path d="M17.5 10 L15 12.5 L11 14" />
    <line x1="19" y1="14" x2="19" y2="22" />
    <line x1="19" y1="14" x2="22" y2="22" />
  </svg>
);

const Incapacitated = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <line x1="15" y1="13" x2="15" y2="22" />
    <circle cx="15" cy="5" r="2" />
    <path d="M15 7 Q12 10 10 13 Q8 15 7 17" />
    <path d="M14 8 L15 13" />
    <path d="M13 10 L15 13" />
    <line x1="7" y1="17" x2="4" y2="22" />
    <line x1="7" y1="17" x2="7" y2="22" />
  </svg>
);

const Invisible = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2L12 19l2.5 2L17 19l3 3V10a8 8 0 0 0-8-8z" />
    <line x1="9" y1="10" x2="9.01" y2="10" />
    <line x1="15" y1="10" x2="15.01" y2="10" />
  </svg>
);

const Paralyzed = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <circle cx="12" cy="4" r="2" />
    <line x1="12" y1="6" x2="12" y2="17" />
    <line x1="3" y1="11" x2="21" y2="11" />
    <line x1="12" y1="17" x2="6" y2="22" />
    <line x1="12" y1="17" x2="18" y2="22" />
  </svg>
);

const Petrified = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <path d="M2 22 L4 14 L8 11 L13 10 L18 12 L21 14 L22 22 Z" />
    <circle cx="12" cy="6" r="2.4" />
    <path d="M7 11 L5 8" />
    <path d="M17 11 L19 8" />
    <circle cx="5" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="19" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

const Poisoned = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <line x1="9" y1="2" x2="15" y2="2" />
    <path d="M10 2 L10 7 L5 15 a5 5 0 0 0 5 7 h4 a5 5 0 0 0 5 -7 L14 7 L14 2" />
    <line x1="6" y1="13" x2="18" y2="13" />
    <circle cx="9" cy="17" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="13" cy="19" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="15" cy="16" r="0.7" fill="currentColor" stroke="none" />
  </svg>
);

const Prone = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <path d="M12 4v12" />
    <path d="m6 12 6 6 6-6" />
    <line x1="3" y1="22" x2="21" y2="22" />
  </svg>
);

const Restrained = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <circle cx="12" cy="4" r="2" />
    <line x1="12" y1="6" x2="12" y2="17" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="12" y1="17" x2="9" y2="22" />
    <line x1="12" y1="17" x2="15" y2="22" />
    <ellipse cx="12" cy="10" rx="3.4" ry="0.9" />
    <ellipse cx="12" cy="12" rx="3.6" ry="0.9" />
    <ellipse cx="12" cy="14" rx="3.6" ry="0.9" />
    <ellipse cx="12" cy="16" rx="3.4" ry="0.9" />
  </svg>
);

const Stunned = ({ className }: IconProps) => (
  <svg {...baseProps} className={className} strokeWidth={1.3}>
    <polyline points="12,12 12.22,12.13 12.25,12.43 12,12.75 11.50,12.87 10.92,12.63 10.50,12 10.48,11.13 11.00,10.27 12,9.75 13.25,9.84 14.38,10.63 15,12 14.82,13.63 13.75,15.03 12,15.75 10,15.46 8.32,14.13 7.50,12 7.88,9.63 9.50,7.67 12,6.75 14.75,7.24 16.98,9.13 18,12 17.41,15.13 15.25,17.63 12,18.75 8.50,18.06 5.72,15.63 4.50,12 5.29,8.13 8,5.07 12,3.75 16.25,4.64 19.58,7.63 21,12" />
  </svg>
);

const Unconscious = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <polyline points="14 4 19 4 14 9 19 9" />
    <polyline points="9 11 14 11 9 16 14 16" />
    <polyline points="4 17 9 17 4 22 9 22" />
  </svg>
);

const CONDITION_ICONS: Record<ConditionName, ComponentType<IconProps>> = {
  Blinded,
  Charmed,
  Deafened,
  Exhaustion,
  Frightened,
  Grappled,
  Incapacitated,
  Invisible,
  Paralyzed,
  Petrified,
  Poisoned,
  Prone,
  Restrained,
  Stunned,
  Unconscious,
};

type ConditionIconProps = {
  name: ConditionName;
  className?: string;
};

export const ConditionIcon = ({ name, className }: ConditionIconProps) => {
  const Icon = CONDITION_ICONS[name];
  return <Icon className={className} />;
};

export default ConditionIcon;
