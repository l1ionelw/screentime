import React from 'react';

/**
 * LoadingScreen component displays a centered loading indicator
 * 
 * @returns {JSX.Element} A loading screen with animation
 */
export default function LoadingScreen() {
    return (
        <div className="loading-container" style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#1e1e1e"
        }}>
            <div className="loading-content" style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px"
            }}>
                <div className="loading-spinner" style={{
                    width: "40px",
                    height: "40px",
                    border: "3px solid rgba(255, 255, 255, 0.1)",
                    borderTop: "3px solid rgba(100, 181, 246, 0.8)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                }}></div>

                <h1 style={{
                    color: "white",
                    fontSize: "24px",
                    fontWeight: "bold",
                    opacity: 0.8,
                    animation: "pulse 1.5s infinite ease-in-out"
                }}>Loading...</h1>
            </div>
        </div>
    );
} 