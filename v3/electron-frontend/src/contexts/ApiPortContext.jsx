import React, { createContext, useContext, useState, useEffect } from 'react';
import {findOpenPort} from "@/utils/findOpenPort.js";

// Create the context
const ApiPortContext = createContext();

// Create the provider component
export const ApiPortProvider = ({ children }) => {
    const [apiPort, setApiPort] = useState(null);

    // Function that you want to run on initialization
    const initializeApiPort = () => {
        console.log('API Port is being initialized');
        // Example: Load the API_PORT from localStorage if it exists
        findOpenPort(6125, 6135).then((port)=>{
            setApiPort(port);
            window.api.setAppPort(port);
        })
    };

    // UseEffect hook that runs on the first render
    useEffect(() => {
        initializeApiPort();
    }, []); // Empty dependency array ensures this runs only once, on initial mount

    return (
        <ApiPortContext.Provider value={{ apiPort, setApiPort }}>
            {children}
        </ApiPortContext.Provider>
    );
};

// Custom hook to use the ApiPortContext
export const useApiPort = () => {
    const context = useContext(ApiPortContext);
    if (!context) {
        throw new Error('useApiPort must be used within an ApiPortProvider');
    }
    return context;
};
