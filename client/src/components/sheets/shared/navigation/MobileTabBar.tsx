export type MobileTabConfig<Id extends string> = {
  id: Id;
  label: string;
  icon: string;
};

type Props<Id extends string> = {
  tabs: MobileTabConfig<Id>[];
  activeTab: Id;
  onTabChange: (tab: Id) => void;
};

export const MobileTabBar = <Id extends string>({
  tabs,
  activeTab,
  onTabChange,
}: Props<Id>) => (
  <div className="sticky bottom-0 inset-x-0 z-20 flex border-t border-rule bg-surface">
    {tabs.map((tab) => (
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
