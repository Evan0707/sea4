
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface LayoutContextType {
 title: string;
 setTitle: (title: string) => void;
 description: string;
 setDescription: (desc: string) => void;
 actions: ReactNode | null;
 setActions: (actions: ReactNode | null) => void;
 setHeader: (props: { title: string; description?: string; actions?: ReactNode }) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
 const [title, setTitle] = useState('');
 const [description, setDescription] = useState('');
 const [actions, setActions] = useState<ReactNode | null>(null);

 const setHeader = React.useCallback(({ title, description = '', actions = null }: { title: string; description?: string; actions?: ReactNode }) => {
  setTitle(title);
  setDescription(description);
  setActions(actions);
 }, []);

 const value = React.useMemo(() => ({
  title,
  setTitle,
  description,
  setDescription,
  actions,
  setActions,
  setHeader
 }), [title, description, actions, setHeader]);

 return (
  <LayoutContext.Provider value={value}>
   {children}
  </LayoutContext.Provider>
 );
};

export const useLayout = () => {
 const context = useContext(LayoutContext);
 if (!context) {
  throw new Error('useLayout must be used within a LayoutProvider');
 }
 return context;
};

// Hook for pages to easily set header
export const usePageHeader = (title: string, actions?: ReactNode, description?: string) => {
 const { setHeader } = useLayout();

 useEffect(() => {
  setHeader({ title, description, actions });
  return () => {
   // Optional: clear header on unmount? Might cause flickering if next page sets it immediately.
   // Usually better to let next page overwrite it.
  };
 }, [title, description, actions, setHeader]);
};
