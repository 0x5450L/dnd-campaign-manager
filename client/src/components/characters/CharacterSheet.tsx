import { useEffect, useState } from "react";
import { CharacterSheetProvider } from "../../context/characterSheetContext/CharacterSheetProvider";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { MobileCharacterSheet } from "./layouts/MobileCharacterSheet";
import { DesktopCharacterSheet } from "./layouts/DesktopCharacterSheet";

const ANIMATION_MS = 200;

type CharacterSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

const CharacterSheetInner = ({ onClose }: { onClose: () => void }) => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileCharacterSheet onClose={onClose} /> : <DesktopCharacterSheet />;
};

export const CharacterSheet = ({ isOpen, onClose }: CharacterSheetProps) => {
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        setMounted(true);
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }

    const raf = requestAnimationFrame(() => setVisible(false));
    const timer = setTimeout(() => setMounted(false), ANIMATION_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto bg-black/70 transition-opacity duration-200 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Character sheet"
      onClick={onClose}
    >
      <div
        className={`relative min-h-full w-full bg-bg origin-center transition-[opacity,transform] duration-200 ease-out ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close character sheet"
          className="fixed top-3 right-3 z-21 w-10 h-10 rounded-full bg-gray-800/90 hover:bg-gray-700 text-gray-200 border border-gray-600 cursor-pointer transition-colors duration-200 hidden items-center justify-center shadow-lg backdrop-blur-sm sm:flex"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <CharacterSheetProvider>
          <CharacterSheetInner onClose={onClose} />
        </CharacterSheetProvider>
      </div>
    </div>
  );
};
