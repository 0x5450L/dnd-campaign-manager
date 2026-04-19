import { useCharacterSheet } from "../../../context/characterSheetContext/useCharacterSheet";

export const MobileHeader = ({ onClose }: { onClose: () => void }) => {
  const { state } = useCharacterSheet();

  const classInfo = [state.characterClass, state.subclass].filter(Boolean).join(" / ");

  return (
    <div className="sticky top-0 z-20 px-4 py-2.5 bg-bg border-b border-rule">
      <div className="truncate text-sm font-bold font-fantasy text-gold">{state.name || "New Character"}</div>
      <div className="text-[11px] text-dim truncate">
        {classInfo || "—"} <span className="text-faint">Lv.{state.level}</span>
        {state.background && <span className="text-faint"> · {state.background}</span>}
      </div>
      <button onClick={onClose} className="absolute top-4 right-4 text-dim hover:text-gold-bright cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};
