import React, { useState } from 'react';
import { cn } from '@/shared/lib/utils';

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
            <div className={cn('w-full', className)}>
                  {/* Tab list */}
                  <div className="flex border-b border-border mb-6" role="tablist">
                        {tabs.map((tab) => {
                              const isActive = activeTab === tab.id;
                              return (
                                    <button
                                          key={tab.id}
                                          role="tab"
                                          aria-selected={isActive}
                                          onClick={() => setActiveTab(tab.id)}
                                          className={cn(
                                                'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                                                isActive
                                                      ? 'text-primary'
                                                      : 'text-text-secondary hover:text-text-primary'
                                          )}
                                    >
                                          {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
                                          {tab.label}
                                          {/* Active underline */}
                                          {isActive && (
                                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                                          )}
                                    </button>
                              );
                        })}
                  </div>

                  {/* Tab content */}
                  <div key={activeTab} className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                        {children(activeTab)}
                  </div>
            </div>
      );
};
