import {Bar, BarChart, CartesianGrid, Tooltip, XAxis, Legend, YAxis} from "recharts";

export default function AppUsageChart({appUsageData}) {
    function getLabelByApp(appName: string) {
        for (const x of appUsageData) {
            if (x.app === appName) {
                return x.hoverLabel
            }
        }
        return "null";
    }

    function CustomToolTip({active, payload, label}) {
        if (active && payload && payload.length) {
            return (
                <div className={"bg-amber-400"}>
                    <p><strong>{label}</strong></p>
                    <p>{getLabelByApp(label)}</p>
                </div>
            )
        }
    }

    return (
        <BarChart width={730} height={250} data={appUsageData}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="app"/>
            <YAxis/>
            <Tooltip content={<CustomToolTip/>}/>
            <Legend/>
            <Bar dataKey="usage" fill="#8884d8"/>
        </BarChart>
    )
}
