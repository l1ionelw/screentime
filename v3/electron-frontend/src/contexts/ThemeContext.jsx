import React, { createContext, useState, useContext, useEffect } from 'react';

// Default theme colors
const defaultTheme = {
    primary: "#81C784",       // Green color for headers and buttons
    secondary: "#64B5F6",     // Blue color for secondary elements
    accent: "#FFD54F",        // Yellow color for accents
    background: "#2a2a2a",    // Dark background
    text: "#ffffff",           // White text
    backgroundAction: "#81c78433", // Button background
    backgroundActionHover: "#81c78466" // Button background hover
};

// Create the context
const ThemeContext = createContext();

/**
 * ThemeProvider component that provides theme state and functions to the application
 */
export const ThemeProvider = ({ children }) => {
    // State to track the current theme
    const [theme, setTheme] = useState(() => {
        // Try to load saved theme from localStorage
        const savedTheme = localStorage.getItem('appTheme');
        return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
    });

    // Apply theme to document when it changes
    useEffect(() => {
        // Update CSS variables
        document.documentElement.style.setProperty('--color-primary', theme.primary);
        document.documentElement.style.setProperty('--color-secondary', theme.secondary);
        document.documentElement.style.setProperty('--color-accent', theme.accent);
        document.documentElement.style.setProperty('--color-background', theme.background);
        document.documentElement.style.setProperty('--color-text', theme.text);
        document.documentElement.style.setProperty('--color-background-action', theme.backgroundAction);
        document.documentElement.style.setProperty('--color-background-action-hover', theme.backgroundActionHover);
    }, [theme]);

    // Save theme to localStorage
    const saveTheme = (newTheme) => {
        const themeToSave = newTheme || theme;
        localStorage.setItem('appTheme', JSON.stringify(themeToSave));
        if (newTheme) {
            setTheme(newTheme);
        }
    };

    // Reset to default theme
    const resetTheme = () => {
        setTheme(defaultTheme);
        localStorage.setItem('appTheme', JSON.stringify(defaultTheme));
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, saveTheme, resetTheme, defaultTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * Custom hook to use the theme context
 */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext; 