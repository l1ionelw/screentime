import React, { useState } from 'react';
import "@/styles.css";

/**
 * SortDropdown component for sorting application data.
 * 
 * @param {Object} props - Component props
 * @param {string} props.sortOption - The current sort option
 * @param {Function} props.setSortOption - Function to update the sort option
 */
const SortDropdown = ({ sortOption, setSortOption }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOptionClick = (option) => {
        setSortOption(option);
        setIsOpen(false);
    };

    return (
        <div className="sort-dropdown">
            <div
                className="action-button dropdown-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span style={{ userSelect: 'none' }}>Sort: {sortOption}</span>
                <span style={{ marginLeft: '8px', userSelect: 'none' }}>▼</span>
            </div>

            {isOpen && (
                <ul className="dropdown-menu">
                    {['Default', 'Greatest', 'Least'].map(option => (
                        <li
                            key={option}
                            onClick={() => handleOptionClick(option)}
                            className={`dropdown-item ${sortOption === option ? 'active' : ''}`}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SortDropdown; 