import React from 'react';
import { secondsFormatter } from "@/utils/secondsFormatter.js";

/**
 * AppListItem component displays a single application item in the list view
 * 
 * @param {Object} props - Component props
 * @param {Object} props.item - The app item data
 * @returns {JSX.Element} A styled list item for an application
 */
export default function AppListItem({ item }) {
    return (
        <div
            className="app-item"
            style={{
                padding: "12px 16px",
                marginBottom: "8px",
                backgroundColor: "rgba(60, 60, 60, 0.5)",
                borderRadius: "8px",
                transition: "transform 0.2s, background-color 0.2s",
                cursor: "default"
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(70, 70, 70, 0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(60, 60, 60, 0.5)";
                e.currentTarget.style.transform = "translateY(0)";
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>{item.app}</h4>
                <span style={{
                    backgroundColor: "rgba(129, 199, 132, 0.2)",
                    color: "#81C784",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "500"
                }}>
                    {secondsFormatter(item.usage)}
                </span>
            </div>
            <p style={{
                fontSize: "13px",
                color: "rgba(255, 255, 255, 0.6)",
                marginTop: "4px",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap"
            }}>{item.path}</p>
        </div>
    );
} 