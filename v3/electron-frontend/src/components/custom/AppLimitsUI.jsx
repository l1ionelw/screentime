import {useEffect, useState} from "react";
import {useApiPort} from "@/contexts/ApiPortContext.jsx";
import {formatUsageLimitString} from "@/utils/formatUsageLimitString.js";
import AddScreenTimeLimit from "@/components/custom/AddScreenTimeLimit.jsx";

export default function AppLimitsUI() {
    const apiPort = useApiPort().apiPort;
    const [currentLimits, setCurrentLimits] = useState(null);
    const [limitPopupMode, setLimitPopupMode] = useState({visible: false, type: "App", selection: "none", limit: "0|0"});
    useEffect(() => {
        fetch(`http://localhost:${apiPort}/limits/`).then(async (response) => {
            if (response.status !== 200) return;
            const jsonLimits = JSON.parse(await response.json());
            console.log(jsonLimits);
            setCurrentLimits(jsonLimits);
        })
    }, []);
    if (!currentLimits) return <div>Loading...</div>
    return (
        <div>
            <div className={"flex gap-x-4 items-center align-middle"}>
                <h1>App Limits</h1>
                <a onClick={() => setLimitPopupMode({...limitPopupMode, visible: !limitPopupMode.visible, type: "App"})}
                   className={"bg-gray-600 rounded p-1.5 cursor-pointer hover:bg-gray-500 hover:duration-150"}>New
                    Limit</a>
            </div>
            {limitPopupMode.visible && limitPopupMode.type === "App" &&
                <AddScreenTimeLimit type={limitPopupMode.type} selection={limitPopupMode.selection}
                                    limit={limitPopupMode.limit}/>}

            {Object.keys(currentLimits["appLimits"]).map((key) => (
                <div>
                    <strong>{key}</strong>
                    <p>{formatUsageLimitString(currentLimits["appLimits"][key])}</p>
                </div>
            ))}
            <div className={"flex gap-x-4 items-center align-middle"}>
                <h1>Website Limits</h1>
                <a onClick={() => setLimitPopupMode({...limitPopupMode, visible: !limitPopupMode.visible, type: "Website"})}
                   className={"bg-gray-600 rounded p-1.5 cursor-pointer hover:bg-gray-500 hover:duration-150"}>New
                    Limit</a>
            </div>
            {limitPopupMode.visible && limitPopupMode.type === "Website" &&
                <AddScreenTimeLimit type={limitPopupMode.type} selection={limitPopupMode.selection}
                                    limit={limitPopupMode.limit}/>}
            {Object.keys(currentLimits["websiteLimits"]).map((key) => (
                <div>
                    <strong>{key}</strong>
                    <p>{formatUsageLimitString(currentLimits["websiteLimits"][key])}</p>
                </div>
            ))}
        </div>
    )
}