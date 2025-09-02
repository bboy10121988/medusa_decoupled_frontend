"use client"

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Theme = 'default' | 'lv';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('default');

  useEffect(() => {
    const currentTheme = theme === 'lv' ? 'theme-lv' : '';
    document.documentElement.className = currentTheme;
    // Remove the other theme class if it exists
    if (theme === 'lv') {
        document.documentElement.classList.remove('theme-default'); // Assuming you might add one
    } else {
        document.documentElement.classList.remove('theme-lv');
    }
    document.documentElement.className = currentTheme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'default' ? 'lv' : 'default'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
