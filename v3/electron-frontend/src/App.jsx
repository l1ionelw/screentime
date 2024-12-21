import {useEffect, useState} from "react";
import {DateTime} from "luxon";
import ScreenTimeLogo from "@/assets/ScreenTimeLogo.jsx";
import {useApiPort} from "@/contexts/ApiPortContext.jsx";
import {calculateAppUsageTimes} from "@/utils/calculateAppUsageTimes.js";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart.tsx"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {filterAppUsageTimes} from "@/utils/filterAppUsageTimes.js";



const appUsageTimesChartConfig = {
    usage: {
        label: "Usage",
        color: "rgb(77, 161, 169)"
    }
}
export default function App() {
    const [currDate, setCurrDate] = useState(() => DateTime.now().startOf("day"));
    const [screenTimeData, setScreenTimeData] = useState(null);
    const [appScreenTimes, setAppScreenTimes] = useState(null);
    const apiPort = useApiPort().apiPort;
    useEffect(() => {
        if (apiPort) fetch(`http://localhost:${apiPort}/filestore/${currDate.year}-${currDate.month}-${currDate.day}.json`).then((data) => {
            if (data.status === 200) {
                console.log("fetched!")
                data.json().then((json) => {
                    setScreenTimeData(json);
                    setAppScreenTimes(filterAppUsageTimes(calculateAppUsageTimes(json), 60));

                })
            } else {
                setScreenTimeData(null)
            }
        }).catch((error)=>{
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
                <Card>
                    <CardHeader>
                        <CardTitle>Bar Chart</CardTitle>
                        <CardDescription>January - June 2024</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={appUsageTimesChartConfig}>
                            <BarChart accessibilityLayer data={appScreenTimes}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="app"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent />}
                                />
                                <Bar dataKey="usage" fill="var(--color-desktop)" radius={8} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}