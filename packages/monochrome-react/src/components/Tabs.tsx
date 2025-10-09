import React, { useState, ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultActiveId?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActiveId,
  onChange,
  className = '',
  style = {}
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveId || tabs[0]?.id);

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`tabs ${className}`} style={style}>
      <div className="tabs-header" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'is-active' : ''} ${tab.disabled ? 'is-disabled' : ''}`}
            onClick={() => handleTabClick(tab.id, tab.disabled)}
            disabled={tab.disabled}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tab-panel-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`tab-panel-${tab.id}`}
            className={`tab-panel ${activeTab === tab.id ? 'is-active' : ''}`}
            role="tabpanel"
            hidden={activeTab !== tab.id}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

Tabs.displayName = 'Tabs';
