import {useEffect, useState} from "react";
import {DateTime, Duration} from "luxon";
import ScreenTimeLogo from "@/assets/ScreenTimeLogo.jsx";
import {useApiPort} from "@/contexts/ApiPortContext.jsx";
import {calculateAppUsageTimes} from "@/utils/calculateAppUsageTimes.js";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart.tsx"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Bar, BarChart, ResponsiveContainer, YAxis} from "recharts"
import {filterAppUsageTimes} from "@/utils/filterAppUsageTimes.js";
import {secondsFormatter} from "@/utils/secondsFormatter.js";
import {produce} from "immer";
import {calculateBrowserUsageTimes} from "@/utils/calculateBrowserUsageTimes.js";
import {filterBrowserUsageTimes} from "@/utils/filterBrowserUsageTimes.js";


const appUsageTimesChartConfig = {
    usage: {
        path: "path",
        color: "rgb(77, 161, 169)"
    }
}
export default function App() {
    const [currDate, setCurrDate] = useState(() => DateTime.now().startOf("day"));
    const [appScreenTimes, setAppScreenTimes] = useState([]);
    const [browserScreenTimes, setBrowserScreenTimes] = useState([]);
    const [dataViewMode, setDataViewMode] = useState({"screenTime": "List", "browserTime": "List"})
    const [selectedTab, setSelectedTab] = useState("Usage");
    const apiPort = useApiPort().apiPort;
    useEffect(() => {
        if (apiPort) fetch(`http://localhost:${apiPort}/filestore/${currDate.year}-${currDate.month}-${currDate.day}.json`).then((data) => {
            if (data.status === 200) {
                console.log("fetched!")
                data.json().then((json) => {
                    setAppScreenTimes(filterAppUsageTimes(calculateAppUsageTimes(json), 60));
                    setBrowserScreenTimes(filterBrowserUsageTimes(calculateBrowserUsageTimes(json), 60));
                })
            }
        }).catch((error) => {
            console.log("couldnt fetch")
            console.error(error.message);
        })
    }, [currDate, apiPort]);


    function changeDate(days) {
        setCurrDate(currDate.plus({days: days}));
    }

    if (apiPort === null) return (<h1>Loading</h1>)
    return (
        <>
            <div
                className="flex gap-1 font-medium items-center">
                <ScreenTimeLogo/>
                <a style={{fontSize: "25px"}}>Screen Time</a>
            </div>
            <div className={"ml-3"}>
                <h1>{currDate.toLocaleString(DateTime.DATE_FULL)}</h1>
                <div className={"gap-x-5 flex"}>
                    <button onClick={() => changeDate(-1)}>Previous</button>
                    <button onClick={() => changeDate(1)}>Next</button>
                </div>


                <div
                    style={{backgroundColor: "#3c3c3c", marginLeft: 5, marginRight: 5, marginTop: 20, borderRadius: 5}}>
                    <div className={"ml-3 pt-5 pb-5"}>
                        <div className={"flex gap-x-3"}>
                            <a style={{color: `${selectedTab === "Usage" ? "" : "gray"}`, cursor: "pointer"}}
                               onClick={() => setSelectedTab("Usage")}>Usage</a>
                            <a style={{color: `${selectedTab === "Limits" ? "" : "gray"}`, cursor: "pointer"}}
                               onClick={() => setSelectedTab("Limits")}>Limits</a>
                            <a style={{color: `${selectedTab === "Settings" ? "" : "gray"}`, cursor: "pointer"}}
                               onClick={() => setSelectedTab("Settings")}>Settings</a>
                        </div>


                        <div className={"flex gap-x-5 items-center"}>
                            <h1>Apps</h1>
                            <p onClick={() => {
                                setDataViewMode(produce(draft => {
                                    draft.screenTime = `${dataViewMode.screenTime === "Bar" ? "List" : "Bar"}`
                                }))
                            }}
                               style={{backgroundColor: "darkgray", borderRadius: 5, cursor: "pointer"}}
                               className={"p-1"}>{dataViewMode.screenTime === "Bar" ? "Show list" : "Show chart"}</p>
                        </div>
                        {selectedTab === "Usage" && <div>
                            {dataViewMode.screenTime === "Bar" && <ResponsiveContainer width={"80%"}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Bar Chart</CardTitle>
                                        <CardDescription>January - June 2024</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ChartContainer config={appUsageTimesChartConfig}>
                                            <BarChart accessibilityLayer data={appScreenTimes} layout={"vertical"}>
                                                <YAxis
                                                    dataKey="app"
                                                    type={"category"}
                                                    tickLine={false}
                                                    tickMargin={10}
                                                    axisLine={false}
                                                />
                                                <Bar dataKey="usage" fill="var(--color-desktop)" radius={8}/>
                                                <ChartTooltip
                                                    cursor={false}
                                                    content={<ChartTooltipContent
                                                        formatter={(value, name, item, index) => (
                                                            <div className={"ml-4"}>
                                                                <p>Usage: {secondsFormatter(item.payload.usage)}</p>
                                                                <p>Path: {item.payload.path}</p>
                                                            </div>
                                                        )}/>}
                                                />
                                            </BarChart>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                            </ResponsiveContainer>}
                            {dataViewMode.screenTime === "List" && <div style={{marginLeft: 10, marginRight: 10}}>
                                {appScreenTimes.map((object) => (
                                    <div key={object.app}>
                                        <p>{object.app}</p>
                                        <p>{object.path}</p>
                                        <p>{secondsFormatter(object.usage)}</p>
                                        <hr/>
                                    </div>
                                ))}
                            </div>}
                        </div>}



                        <div className={"flex gap-x-5 items-center"}>
                            <h1>Browser Tabs</h1>
                            <p onClick={() => {
                                setDataViewMode(produce(draft => {
                                    draft.browserTime = `${dataViewMode.browserTime === "Bar" ? "List" : "Bar"}`
                                }))
                            }}
                               style={{backgroundColor: "darkgray", borderRadius: 5, cursor: "pointer"}}
                               className={"p-1"}>{dataViewMode.browserTime === "Bar" ? "Show list" : "Show chart"}</p>
                        </div>
                        {selectedTab === "Usage" && <div>
                            {dataViewMode.browserTime === "Bar" && <ResponsiveContainer width={"80%"}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Bar Chart</CardTitle>
                                        <CardDescription>January - June 2024</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ChartContainer config={appUsageTimesChartConfig}>
                                            <BarChart accessibilityLayer data={appScreenTimes} layout={"vertical"}>
                                                <YAxis
                                                    dataKey="app"
                                                    type={"category"}
                                                    tickLine={false}
                                                    tickMargin={10}
                                                    axisLine={false}
                                                />
                                                <Bar dataKey="usage" fill="var(--color-desktop)" radius={8}/>
                                                <ChartTooltip
                                                    cursor={false}
                                                    content={<ChartTooltipContent
                                                        formatter={(value, name, item, index) => (
                                                            <div className={"ml-4"}>
                                                                <p>Usage: {secondsFormatter(item.payload.usage)}</p>
                                                                <p>Path: {item.payload.path}</p>
                                                            </div>
                                                        )}/>}
                                                />
                                            </BarChart>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                            </ResponsiveContainer>}
                            {dataViewMode.browserTime === "List" && <div style={{marginLeft: 10, marginRight: 10}} w>
                                {browserScreenTimes.map((object) => (
                                    <div key={object.path}>
                                        <p>{object.path}</p>
                                        <p>{object.tab}</p>
                                        <p>{secondsFormatter(object.usage)}</p>
                                        <hr/>
                                    </div>
                                ))}
                            </div>}
                        </div>}


                    </div>
                </div>
            </div>
        </>
    )
}