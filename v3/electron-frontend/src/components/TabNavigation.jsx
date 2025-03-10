import React from 'react';

/**
 * TabNavigation component for switching between different tabs in the application.
 * 
 * @param {Object} props - Component props
 * @param {string} props.selectedTab - The currently selected tab
 * @param {Function} props.setSelectedTab - Function to set the selected tab
 */
const TabNavigation = ({ selectedTab, setSelectedTab }) => {
    return (
        <div className="tabs" style={{
            display: "flex",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "0 20px"
        }}>
            <div
                className={`tab ${selectedTab === "Usage" ? "active" : ""}`}
                style={{
                    padding: "16px 24px",
                    cursor: "pointer",
                    position: "relative",
                    color: selectedTab === "Usage" ? "#64B5F6" : "rgba(255, 255, 255, 0.6)",
                    fontWeight: selectedTab === "Usage" ? "600" : "normal",
                    fontSize: "16px",
                    transition: "color 0.3s"
                }}
                onClick={() => setSelectedTab("Usage")}
            >
                Usage
                {selectedTab === "Usage" && (
                    <div style={{
                        position: "absolute",
                        bottom: "0",
                        left: "0",
                        width: "100%",
                        height: "3px",
                        backgroundColor: "#64B5F6",
                        borderTopLeftRadius: "3px",
                        borderTopRightRadius: "3px"
                    }}></div>
                )}
            </div>

            <div
                className={`tab ${selectedTab === "OptionsPanel" ? "active" : ""}`}
                style={{
                    padding: "16px 24px",
                    cursor: "pointer",
                    position: "relative",
                    color: selectedTab === "OptionsPanel" ? "#64B5F6" : "rgba(255, 255, 255, 0.6)",
                    fontWeight: selectedTab === "OptionsPanel" ? "600" : "normal",
                    fontSize: "16px",
                    transition: "color 0.3s"
                }}
                onClick={() => setSelectedTab("OptionsPanel")}
            >
                Options
                {selectedTab === "OptionsPanel" && (
                    <div style={{
                        position: "absolute",
                        bottom: "0",
                        left: "0",
                        width: "100%",
                        height: "3px",
                        backgroundColor: "#64B5F6",
                        borderTopLeftRadius: "3px",
                        borderTopRightRadius: "3px"
                    }}></div>
                )}
            </div>

            <div
                className={`tab ${selectedTab === "Settings" ? "active" : ""}`}
                style={{
                    padding: "16px 24px",
                    cursor: "pointer",
                    position: "relative",
                    color: selectedTab === "Settings" ? "#64B5F6" : "rgba(255, 255, 255, 0.6)",
                    fontWeight: selectedTab === "Settings" ? "600" : "normal",
                    fontSize: "16px",
                    transition: "color 0.3s"
                }}
                onClick={() => setSelectedTab("Settings")}
            >
                Settings
                {selectedTab === "Settings" && (
                    <div style={{
                        position: "absolute",
                        bottom: "0",
                        left: "0",
                        width: "100%",
                        height: "3px",
                        backgroundColor: "#64B5F6",
                        borderTopLeftRadius: "3px",
                        borderTopRightRadius: "3px"
                    }}></div>
                )}
            </div>
        </div>
    );
};

export default TabNavigation; 