import React from 'react';
import ScreenTimeLogo from "@/assets/ScreenTimeLogo.jsx";

const AppHeader = () => {
    return (
        <header className="app-header">
            <div className="logo-container" style={{
                display: "flex",
                alignItems: "center",
                gap: "12px"
            }}>
                <ScreenTimeLogo />
                <h1 style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    background: "linear-gradient(90deg, #64B5F6 0%, #81C784 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>Screen Time</h1>
            </div>
        </header>
    );
};

export default AppHeader; 