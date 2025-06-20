import React, { createContext, useContext, useState, useEffect } from 'react';

interface StealthContextType {
  isSecretMode: boolean;
  toggleSecretMode: () => void;
}

const StealthContext = createContext<StealthContextType | undefined>(undefined);

export function StealthProvider({ children }: { children: React.ReactNode }) {
  const [isSecretMode, setIsSecretMode] = useState(() => {
    const saved = localStorage.getItem('secretMode');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleSecretMode = () => {
    setIsSecretMode(prev => {
      const newValue = !prev;
      localStorage.setItem('secretMode', JSON.stringify(newValue));
      return newValue;
    });
  };

  useEffect(() => {
    localStorage.setItem('secretMode', JSON.stringify(isSecretMode));
  }, [isSecretMode]);

  return (
    <StealthContext.Provider value={{ isSecretMode, toggleSecretMode }}>
      {children}
    </StealthContext.Provider>
  );
}

export function useStealthMode() {
  const context = useContext(StealthContext);
  if (context === undefined) {
    throw new Error('useStealthMode must be used within a StealthProvider');
  }
  return context;
}