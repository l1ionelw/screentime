import React from 'react';
import { secondsFormatter } from "@/utils/secondsFormatter.js";
import "@/styles.css";

/**
 * AppItem component for displaying individual application usage data.
 * 
 * @param {Object} props - Component props
 * @param {string} props.appName - The name of the application
 * @param {number} props.usage - The usage time in seconds
 * @param {string} props.path - The path of the application
 */
const AppItem = ({ appName, usage, path }) => {
    return (
        <div className="app-item">
            <div className="app-item-header">
                <h4 className="app-item-title">
                    {appName}
                </h4>
                <span className="app-item-time">
                    {secondsFormatter(usage)}
                </span>
            </div>
            <p className="app-item-path">{path}</p>
        </div>
    );
};

export default AppItem; 