import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {ThemeProvider} from "./components/theme-provider.tsx";

export const API_URL = "http://localhost:5000"

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider defaultTheme={"light"} storageKey={"vite-ui-theme"}>
            <App/>
        </ThemeProvider>
    </React.StrictMode>,
)
