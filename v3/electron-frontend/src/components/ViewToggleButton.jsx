import React from 'react';
import { produce } from "immer";
import "@/styles.css";

/**
 * ViewToggleButton component for toggling between different view modes.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.dataViewMode - The current view mode state object
 * @param {Function} props.setDataViewMode - Function to update the view mode state
 * @param {string} props.viewType - The type of view to toggle (e.g., "screenTime", "browserTime")
 */
const ViewToggleButton = ({ dataViewMode, setDataViewMode, viewType }) => {
    const handleToggle = () => {
        setDataViewMode(produce(draft => {
            draft[viewType] = `${dataViewMode[viewType] === "Bar" ? "List" : "Bar"}`
        }));
    };

    return (
        <button
            onClick={handleToggle}
            className="action-button"
        >
            {dataViewMode[viewType] === "Bar" ? "Show as List" : "Show as Chart"}
        </button>
    );
};

export default ViewToggleButton; 