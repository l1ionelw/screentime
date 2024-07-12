import "./App.css"
import {useEffect, useState} from "react";
import getHistoryJson from "./utils/getHistoryJson.ts";
import getTimePerApp from "./utils/getTimePerApp.ts";
import AppUsageBarChart from "./components/AppUsageBarChart.tsx";
import setAppOrdered from "./utils/setAppOrdered.ts";
import AppTimelineFormatted from "./components/AppTimelineFomatted.tsx";

function App() {
    const [appUsageData, setAppUsageData] = useState();
    const [appUsageTimeline, setAppUsageTimeline] = useState();
    useEffect(() => {
        getHistoryJson("current.json").then((resp) => {
            console.log("setting app usage data")
            const appUsageData = getTimePerApp(resp.response.entries);
            appUsageData.sort((a, b) => b.usage - a.usage)
            console.log(appUsageData);
            setAppUsageData(appUsageData);

            const appOrderedHistory = setAppOrdered(resp.response.entries, false);
            console.log(appOrderedHistory)
            setAppUsageTimeline(appOrderedHistory);
        })
    }, [])
    if (appUsageTimeline) {
        return (
            <div className={"ml-5"}>
                <h1>Screen Time</h1>
                <h3>App Usage</h3>
                <AppUsageBarChart appUsageData={appUsageData}/>
                <AppTimelineFormatted timeline={appUsageTimeline} showStartEndRange={true}/>
            </div>
        )
    }
    return (
        <h1>Loading</h1>
    )

}

export default App
