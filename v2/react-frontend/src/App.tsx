import "./App.css"
import {useEffect, useState} from "react";
import getHistoryJson from "./utils/getHistoryJson.ts";
import getTimePerApp from "./utils/getTimePerApp.ts";
import AppUsageBarChart from "./components/AppUsageBarChart.tsx";
import generateAppTimeline from "./utils/generateAppTimeline.ts";
import AppTimelineFormatted from "./components/AppTimelineFomatted.tsx";
import generateTabTimeline from "./utils/generateTabTimeline.ts";
import TabTimelineFormatted from "./components/TabTimelineFormatted.tsx";
import {DateTime} from "luxon";
import {stat} from "fs";

export const API_URL = `http://localhost:${import.meta.env.VITE_SERVER_PORT}`;
console.log(API_URL);

function App() {
    const [status, setStatus] = useState("Loading");
    const [appUsageData, setAppUsageData] = useState();
    const [appUsageTimeline, setAppUsageTimeline] = useState();
    const [webTabUsageTimeline, setWebTabUsageTimeline] = useState();
    const [selection, setSelection] = useState("None");
    const [selectedDay, setSelectedDay] = useState(() => DateTime.now().toISODate());

    console.log(selectedDay);
    console.log(generateFilenameFromDate(selectedDay));

    useEffect(() => {
        setStatus("Loading");
        getHistoryJson(generateFilenameFromDate(selectedDay)).then((resp) => {
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
            setStatus("Success");
        }).catch(() => {
            setStatus("Error");
        })
    }, [selectedDay])

    function generateFilenameFromDate(isoDate: string) {
        return `${isoDate === DateTime.now().toISODate().toString() ? "current" : isoDate}.json`
    }

    function changeCurrentDay(operation: string) {
        if (operation === "Back") {
            setSelectedDay(() => DateTime.fromISO(selectedDay).minus({hours: 24}).toISODate());
        }
        if (operation === "Forward") {
            setSelectedDay(() => DateTime.fromISO(selectedDay).plus({hours: 24}).toISODate());
        }
    }

    if (appUsageTimeline) {
        return (
            <div className={"ml-5 pb-20"}>
                <h1>Screen Time</h1>
                <div>
                    <p>{selectedDay}</p>
                    <button onClick={() => changeCurrentDay("Back")}>Back</button>
                    <button onClick={() => changeCurrentDay("Forward")}>Forward</button>
                </div>
                <h3>App Usage</h3>
                {status === "Loading" && <h1>loading</h1>}
                {status === "Error" && <h1>This entry doesn't exist</h1>}
                <div hidden={status !== "Success"}>
                    <AppUsageBarChart appUsageData={appUsageData}/>
                    <br/><br/><br/>
                    <div className={"flex gap-x-4"}>
                        <button onClick={() => setSelection(selection !== "AppUsage" ? "AppUsage" : "None")}>Show App
                            History
                        </button>
                        <button onClick={() => setSelection(selection !== "TabUsage" ? "TabUsage" : "None")}>Show
                            Website
                            History
                        </button>
                        <button onClick={() => setSelection("None")}>Hide All</button>
                    </div>

                    <div hidden={selection !== "AppUsage"}><AppTimelineFormatted timeline={appUsageTimeline}
                                                                                 showStartEndRange={false}/></div>
                    <div hidden={selection !== "TabUsage"}><TabTimelineFormatted entries={webTabUsageTimeline}/></div>
                </div>
            </div>
        )
    }
    return (
        <h1>Loading</h1>
    )

}

export default App
