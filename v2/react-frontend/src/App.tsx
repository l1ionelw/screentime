import "./App.css"
import {useEffect, useState} from "react";
import getHistoryJson from "./utils/getHistoryJson.ts";
import getTimePerApp from "./utils/getTimePerApp.ts";
import AppUsageBarChart from "./components/AppUsageBarChart.tsx";
import generateAppTimeline from "./utils/generateAppTimeline.ts";
import AppTimelineFormatted from "./components/AppTimelineFomatted.tsx";
import generateTabTimeline from "./utils/generateTabTimeline.ts";
import TabTimelineFormatted from "./components/TabTimelineFormatted.tsx";

function App() {
    const [appUsageData, setAppUsageData] = useState();
    const [appUsageTimeline, setAppUsageTimeline] = useState();
    const [webTabUsageTimeline, setWebTabUsageTimeline] = useState();
    const [selection, setSelection] = useState("None");
    useEffect(() => {
        getHistoryJson("current.json").then((resp) => {
            console.log("setting app usage data")
            const appUsageData = getTimePerApp(resp.response.entries);
            appUsageData.sort((a, b) => b.usage - a.usage)
            console.log(appUsageData);
            setAppUsageData(appUsageData);

            const appOrderedHistory = generateAppTimeline(resp.response.entries, true);
            console.log(appOrderedHistory)
            setAppUsageTimeline(appOrderedHistory);

            console.log("geeratina tabs timeline");
            const tabTimeline = generateTabTimeline(resp.response.entries);
            console.log(tabTimeline);
            setWebTabUsageTimeline(tabTimeline);
        })
    }, [])

    if (appUsageTimeline) {
        return (
            <div className={"ml-5 pb-20"}>
                <h1>Screen Time</h1>
                <h3>App Usage</h3>
                <AppUsageBarChart appUsageData={appUsageData}/>
                <br/><br/><br/>
                <div className={"flex gap-x-4"}>
                    <button onClick={()=>setSelection(selection !== "AppUsage" ? "AppUsage" : "None")}>Show App History</button>
                    <button onClick={()=>setSelection(selection !== "TabUsage" ? "TabUsage" : "None")}>Show Website History</button>
                    <button onClick={()=>setSelection("None")}>Hide All</button>
                </div>

                <div hidden={selection !== "AppUsage"}><AppTimelineFormatted timeline={appUsageTimeline} showStartEndRange={false}/></div>
                <div hidden={selection !== "TabUsage"}><TabTimelineFormatted entries={webTabUsageTimeline}/></div>
            </div>
        )
    }
    return (
        <h1>Loading</h1>
    )

}

export default App
