import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext.jsx';
import "@/styles.css";

/**
 * Settings component that includes a theme customizer
 * Allows users to change the color scheme of the application
 * and saves preferences for persistence
 */
const GeneralSettings = () => {
    // Get theme from context
    const { theme, setTheme, saveTheme, resetTheme, defaultTheme } = useTheme();

    // Create a local copy of the theme for editing
    const [localTheme, setLocalTheme] = useState(theme);

    // State to track if changes are saved
    const [saved, setSaved] = useState(true);

    // Preset themes
    const presetThemes = [
        {
            name: "Default Green",
            colors: defaultTheme
        },
        {
            name: "Ocean Blue",
            colors: {
                primary: "#64B5F6",
                secondary: "#4FC3F7",
                accent: "#FFD54F",
                background: "#263238",
                text: "#ECEFF1",
                backgroundAction: "#64B5F633",
                backgroundActionHover: "#64B5F666"
            }
        },
        {
            name: "Sunset Orange",
            colors: {
                primary: "#FF7043",
                secondary: "#FFB74D",
                accent: "#9575CD",
                background: "#37474F",
                text: "#FAFAFA",
                backgroundAction: "#FF704333",
                backgroundActionHover: "#FF704366"
            }
        },
        {
            name: "Purple Rain",
            colors: {
                primary: "#9C27B0",
                secondary: "#7E57C2",
                accent: "#26A69A",
                background: "#212121",
                text: "#E0E0E0",
                backgroundAction: "#9C27B033",
                backgroundActionHover: "#9C27B066"
            }
        },
        {
            name: "Dark Mode",
            colors: {
                primary: "#BB86FC",
                secondary: "#03DAC6",
                accent: "#CF6679",
                background: "#121212",
                text: "#E0E0E0",
                backgroundAction: "#BB86FC33",
                backgroundActionHover: "#BB86FC66"
            }
        }
    ];

    // Update local theme when context theme changes
    useEffect(() => {
        setLocalTheme(theme);
    }, [theme]);

    // Handle color change
    const handleColorChange = (colorKey, value) => {
        setLocalTheme(prev => ({
            ...prev,
            [colorKey]: value
        }));
        setSaved(false);
    };

    // Apply preset theme
    const applyPresetTheme = (presetColors) => {
        setLocalTheme(presetColors);
        setSaved(false);
    };

    // Save theme changes
    const handleSaveTheme = () => {
        setTheme(localTheme);
        saveTheme(localTheme);
        setSaved(true);
    };

    // Reset to default theme
    const handleResetTheme = () => {
        setLocalTheme(defaultTheme);
        setSaved(false);
    };

    // Check if current theme is different from saved theme
    useEffect(() => {
        setSaved(JSON.stringify(localTheme) === JSON.stringify(theme));
    }, [localTheme, theme]);

    return (
        <div className="settings-container">
            <h3 className="section-title">Settings</h3>

            <div className="theme-customizer">
                <h4 className="settings-subtitle">Theme Customizer</h4>

                <div className="theme-preview" style={{
                    backgroundColor: localTheme.background,
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: `1px solid ${localTheme.primary}`
                }}>
                    <h5 style={{ color: localTheme.primary, marginBottom: '10px' }}>Preview Header</h5>
                    <p style={{ color: localTheme.text }}>This is how your theme will look.</p>
                    <div style={{
                        backgroundColor: 'rgba(60, 60, 60, 0.5)',
                        padding: '10px',
                        borderRadius: '6px',
                        marginTop: '10px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: localTheme.text }}>Sample App</span>
                            <span style={{
                                backgroundColor: `${localTheme.primary}33`,
                                color: localTheme.primary,
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '14px'
                            }}>2h 30m</span>
                        </div>
                    </div>
                    <button style={{
                        backgroundColor: `${localTheme.primary}33`,
                        color: localTheme.primary,
                        border: `1px solid ${localTheme.primary}4D`,
                        padding: '6px 14px',
                        borderRadius: '6px',
                        marginTop: '15px',
                        cursor: 'pointer'
                    }}>
                        Sample Button
                    </button>
                </div>

                <div className="preset-themes">
                    <h5 className="settings-subtitle">Preset Themes</h5>
                    <div className="preset-buttons">
                        {presetThemes.map((presetTheme, index) => (
                            <button
                                key={index}
                                onClick={() => applyPresetTheme(presetTheme.colors)}
                                className="preset-theme-button"
                                style={{
                                    backgroundColor: presetTheme.colors.background,
                                    borderColor: presetTheme.colors.primary,
                                }}
                            >
                                <span style={{ color: presetTheme.colors.primary }}>{presetTheme.name}</span>
                                <div className="preset-colors">
                                    <div style={{ backgroundColor: presetTheme.colors.primary }}></div>
                                    <div style={{ backgroundColor: presetTheme.colors.secondary }}></div>
                                    <div style={{ backgroundColor: presetTheme.colors.accent }}></div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <h5 className="settings-subtitle">Custom Colors</h5>
                <div className="color-pickers">
                    <div className="color-picker-group">
                        <label>Primary Color (Headers, Buttons)</label>
                        <div className="color-input-container">
                            <input
                                type="color"
                                value={localTheme.primary}
                                onChange={(e) => handleColorChange('primary', e.target.value)}
                                className="color-picker"
                            />
                            <input
                                type="text"
                                value={localTheme.primary}
                                onChange={(e) => handleColorChange('primary', e.target.value)}
                                className="color-text-input"
                            />
                        </div>
                    </div>

                    <div className="color-picker-group">
                        <label>Secondary Color</label>
                        <div className="color-input-container">
                            <input
                                type="color"
                                value={localTheme.secondary}
                                onChange={(e) => handleColorChange('secondary', e.target.value)}
                                className="color-picker"
                            />
                            <input
                                type="text"
                                value={localTheme.secondary}
                                onChange={(e) => handleColorChange('secondary', e.target.value)}
                                className="color-text-input"
                            />
                        </div>
                    </div>

                    <div className="color-picker-group">
                        <label>Accent Color</label>
                        <div className="color-input-container">
                            <input
                                type="color"
                                value={localTheme.accent}
                                onChange={(e) => handleColorChange('accent', e.target.value)}
                                className="color-picker"
                            />
                            <input
                                type="text"
                                value={localTheme.accent}
                                onChange={(e) => handleColorChange('accent', e.target.value)}
                                className="color-text-input"
                            />
                        </div>
                    </div>

                    <div className="color-picker-group">
                        <label>Background Color</label>
                        <div className="color-input-container">
                            <input
                                type="color"
                                value={localTheme.background}
                                onChange={(e) => handleColorChange('background', e.target.value)}
                                className="color-picker"
                            />
                            <input
                                type="text"
                                value={localTheme.background}
                                onChange={(e) => handleColorChange('background', e.target.value)}
                                className="color-text-input"
                            />
                        </div>
                    </div>

                    <div className="color-picker-group">
                        <label>Text Color</label>
                        <div className="color-input-container">
                            <input
                                type="color"
                                value={localTheme.text}
                                onChange={(e) => handleColorChange('text', e.target.value)}
                                className="color-picker"
                            />
                            <input
                                type="text"
                                value={localTheme.text}
                                onChange={(e) => handleColorChange('text', e.target.value)}
                                className="color-text-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="theme-actions">
                    <button
                        onClick={handleSaveTheme}
                        className={`action-button ${!saved ? 'primary-button' : ''}`}
                        disabled={saved}
                    >
                        {saved ? 'Saved' : 'Save Theme'}
                    </button>
                    <button
                        onClick={handleResetTheme}
                        className="action-button secondary-button"
                    >
                        Reset to Default
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings; 