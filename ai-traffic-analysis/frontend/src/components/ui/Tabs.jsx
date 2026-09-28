import { useState } from 'react';

const Tabs = ({ tabs, defaultTab, onChange, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key);

  const handleTabClick = (key) => {
    setActiveTab(key);
    onChange?.(key);
  };

  return (
    <div className={className}>
      <div className="flex gap-1 bg-gray-100 dark:bg-navy-800 p-1 rounded-xl" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-white text-primary-700 dark:bg-navy-900 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
            disabled={tab.disabled}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            {tab.badge && (
              <span className="badge-neutral px-1.5 py-0.5 text-[10px]">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.map((tab) =>
          activeTab === tab.key && tab.content
        )}
      </div>
    </div>
  );
};

export default Tabs;