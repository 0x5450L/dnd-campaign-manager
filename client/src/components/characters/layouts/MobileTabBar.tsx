export type MobileTab = "combat" | "stats" | "lore";

const TAB_META: { id: MobileTab; label: string; icon: string }[] = [
  { id: "combat", label: "Combat", icon: "⚔" },
  { id: "stats", label: "Stats", icon: "◆" },
  { id: "lore", label: "Lore", icon: "📜" },
];

type Props = {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
};

export const MobileTabBar = ({ activeTab, onTabChange }: Props) => (
  <div className="fixed bottom-0 inset-x-0 z-20 flex border-t border-rule bg-surface">
    {TAB_META.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
          activeTab === tab.id
            ? "text-gold"
            : "text-dim hover:text-gold-bright"
        }`}
      >
        <span className="text-base leading-none">{tab.icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider font-fantasy">
          {tab.label}
        </span>
      </button>
    ))}
  </div>
);
