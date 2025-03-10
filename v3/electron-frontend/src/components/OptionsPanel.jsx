import { useApiPort } from "@/contexts/ApiPortContext.jsx";
import { useState, useEffect } from "react";
import { produce } from 'immer';

function OptionsPanel() {
    const apiPort = useApiPort().apiPort;
    const [config, setConfig] = useState(null);
    const [serverOnlineState, setServerOnlineState] = useState(true);
    const [trayappOnlineState, setTrayappOnlineState] = useState(false);

    useEffect(() => {
        if (apiPort) {
            fetch(`http://localhost:${apiPort}/config/`).then((data) => {
                if (data.status === 200) {
                    data.json().then((json) => {
                        console.log(json);
                        setConfig(json);
                    })
                }
            })
        }
        // try ping server, if works, then set serverOnlineState to true
        fetch(`http://localhost:${apiPort}/`).then((data) => {
            if (data.status === 200) {
                console.log(data.text());
                setServerOnlineState(true);
            }
        });
        console.log("trayapp status: ");
        window.api.checkTrayappStatus().then((result) => {
            console.log(result);
            setTrayappOnlineState(result);
        });


    }, [apiPort]);

    const handleToggle = () => {
        if (config) {
            const updatedConfig = produce(config, draft => {
                draft.trayapp.showwindow = !draft.trayapp.showwindow;
            });
            setConfig(updatedConfig);
            console.log(updatedConfig);
            fetch(`http://localhost:${apiPort}/config/update/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedConfig),
            });
        }
    };

    return (
        <div className="settings-container">
            <h3 className="section-title">Local Service Status</h3>
            <div className="settings-section">
                <span
                    className="server-circle"
                    style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: serverOnlineState ? 'green' : 'red',
                        marginRight: '8px'
                    }}
                />
                <span>{serverOnlineState ? `Server is online - Port ${apiPort}` : 'Server is offline'}</span>
                <br />
                <span
                    className="server-circle"
                    style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: trayappOnlineState ? 'green' : 'red',
                        marginRight: '8px'
                    }}
                />
                <span>{trayappOnlineState ? `Tray App running` : 'Tray App is not running'}</span>

                <h3 className="section-title">Trayapp options</h3>
                <div className="settings-section">
                    {config &&
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config.trayapp.showwindow}
                                    onChange={handleToggle}
                                    className="toggle-checkbox visually-appealing-checkbox"
                                />
                                <span className="toggle-label">Show Current Window Overlay</span>
                            </label>
                    }
                    {!config && <div>Failed to load server config</div>}
                </div>
            </div>
        </div>
    );
}

export default OptionsPanel;