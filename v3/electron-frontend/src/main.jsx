import ReactDOM from 'react-dom/client'
import './index.css'
import App from "./App.jsx";
import {ApiPortProvider} from "@/contexts/ApiPortContext.jsx";
import React from 'react';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ApiPortProvider>
            <App/>
        </ApiPortProvider>
    </React.StrictMode>,
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
})
