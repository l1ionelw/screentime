import {
    Bar,
    BarChart,
    Tooltip,
    XAxis,
    Legend,
    YAxis,
    ResponsiveContainer,
    Label,
    LabelList
} from "recharts";

export default function AppUsageBarChart({appUsageData}) {
    function CustomToolTip({active, payload, label}) {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: "gray",
                    border: "2px black solid",
                    borderRadius: "0.24rem",
                    lineHeight: "0.75rem",
                    padding: "0.5rem",
                }}>
                    <p><strong>{payload.app}</strong></p>
                    <p>{payload[0].payload.appInfo.path}</p>
                    <p>{payload[0].payload.hoverLabel}</p>
                </div>
            )
        }
    }


    return (
        <ResponsiveContainer width={"80%"} height={400}>
            <BarChart data={appUsageData} layout={"vertical"} margin={{left: 10}}>
                <YAxis dataKey={"app"} type={"category"} width={250}/>
                <XAxis dataKey={"usage"} type={"number"}>
                    <Label value="Usage Per App" offset={0} position="insideBottom"/>
                </XAxis>
                <Tooltip content={<CustomToolTip/>}/>
                <Legend/>
                <Bar dataKey="usage" fill="#8884d8">
                    <LabelList dataKey="hoverLabel" position={"right"}/>
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
