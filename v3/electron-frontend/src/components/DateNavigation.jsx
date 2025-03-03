import React from 'react';
import { DateTime } from 'luxon';

/**
 * DateNavigation component for displaying and controlling date navigation
 * 
 * @param {Object} props - Component props
 * @param {DateTime} props.currDate - The current selected date (Luxon DateTime object)
 * @param {Function} props.setCurrDate - function to set the current date
 */
const DateNavigation = ({ currDate, setCurrDate }) => {
    function changeDate(days) {
        setCurrDate(currDate.plus({ days: days }));
    }
    return (
        <div className="date-navigation">
            <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#e0e0e0"
            }}>
                {currDate.weekdayLong}, {currDate.toLocaleString(DateTime.DATE_FULL)}
            </h2>

            <div className="date-controls" style={{
                display: "flex",
                gap: "12px"
            }}>
                <button
                    onClick={() => setCurrDate(DateTime.now().startOf("day"))}
                    style={{
                        backgroundColor: "#3a3a3a",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        fontWeight: "500"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#4a4a4a"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3a3a3a"}
                >
                    Today
                </button>
                <button
                    onClick={() => changeDate(-1)}
                    style={{
                        backgroundColor: "#3a3a3a",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        fontWeight: "500"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#4a4a4a"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3a3a3a"}
                >
                    Previous Day
                </button>
                <button
                    onClick={() => changeDate(1)}
                    disabled={currDate.equals(DateTime.now().startOf("day"))}
                    style={{
                        backgroundColor: currDate.equals(DateTime.now().startOf("day")) ? "#2a2a2a" : "#3a3a3a",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: currDate.equals(DateTime.now().startOf("day")) ? "not-allowed" : "pointer",
                        transition: "background-color 0.2s",
                        fontWeight: "500",
                        opacity: currDate.equals(DateTime.now().startOf("day")) ? 0.5 : 1
                    }}
                    onMouseOver={(e) => {
                        if (!currDate.equals(DateTime.now().startOf("day"))) {
                            e.currentTarget.style.backgroundColor = "#4a4a4a";
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!currDate.equals(DateTime.now().startOf("day"))) {
                            e.currentTarget.style.backgroundColor = "#3a3a3a";
                        }
                    }}
                >
                    Next Day
                </button>
            </div>
        </div>
    );
};

export default DateNavigation; 