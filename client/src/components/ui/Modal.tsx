import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useOverlayLayer } from "@/hooks/useOverlayLayer";
import { CloseIcon } from "./icons";

const BASE_Z_INDEX = 100;
const Z_INDEX_STEP = 10;

const PANEL_WIDTHS = {
  sm: "max-w-sm",
  md: "max-w-xl",
  lg: "max-w-2xl",
} as const;

type ModalProps = {
  onClose: () => void;
  title?: ReactNode;
  actions?: ReactNode;
  width?: keyof typeof PANEL_WIDTHS;
  align?: "center" | "start";
  label: string;
  children: ReactNode;
};

export const Modal = ({
  onClose,
  title,
  actions,
  width = "md",
  align = "center",
  label,
  children,
}: ModalProps) => {
  const { depth } = useOverlayLayer(onClose, { lockScroll: true });

  return createPortal(
    <div
      onClick={onClose}
      style={{ zIndex: BASE_Z_INDEX + depth * Z_INDEX_STEP }}
      className={`fixed inset-0 flex justify-center overflow-y-auto bg-black/60 p-4 ${
        align === "start" ? "items-start" : "items-center"
      }`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={`custom-scrollbar relative flex max-h-[85vh] w-full ${PANEL_WIDTHS[width]} flex-col gap-4 overflow-y-auto rounded-md border border-rule bg-surface p-4 shadow-xl sm:p-5`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2">{title}</div>
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded border border-rule text-faint transition-colors hover:border-hover hover:text-ink"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
