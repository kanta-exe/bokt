import { useState } from "react";

type Tab = { id: string; label: string };

export default function Tabs({ 
  tabs, 
  initial, 
  onChange, 
  activeTab, 
  onTabChange 
}: { 
  tabs: Tab[]; 
  initial?: string; 
  onChange?: (id: string) => void;
  activeTab?: string;
  onTabChange?: (id: string) => void;
}) {
  const [internalActive, setInternalActive] = useState(initial ?? tabs[0]?.id);
  const active = activeTab !== undefined ? activeTab : internalActive;
  return (
    <div className="border-b">
      <div role="tablist" aria-label="Tabs" className="-mb-px flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${active === t.id ? "border-accent text-accent" : "border-transparent text-neutral-600 hover:text-neutral-800"}`}
            onClick={() => { 
              if (onTabChange) {
                onTabChange(t.id);
              } else {
                setInternalActive(t.id);
                onChange?.(t.id);
              }
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}



