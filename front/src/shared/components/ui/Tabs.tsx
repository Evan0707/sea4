import React, { useState } from 'react';

interface Tab {
 id: string;
 label: string;
 icon?: React.ReactNode;
}

interface TabsProps {
 tabs: Tab[];
 defaultTab?: string;
 children: (activeTab: string) => React.ReactNode;
 className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, children, className = '' }) => {
 const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

 return (
  <div className={`w-full ${className}`}>
   <div className="flex border-b border-border mb-6">
    {tabs.map((tab) => (
     <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`
              flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative
              ${activeTab === tab.id
        ? 'text-primary'
        : 'text-placeholder hover:text-text-primary'
       }
            `}
     >
      {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
      {tab.label}
      {activeTab === tab.id && (
       <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
      )}
     </button>
    ))}
   </div>
   <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
    {children(activeTab)}
   </div>
  </div>
 );
};
