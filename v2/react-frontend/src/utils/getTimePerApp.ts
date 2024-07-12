import {SingleStore} from "../interfaces.ts";
import {DateTime, Duration} from "luxon";
import generateAppName from "./generateAppName.ts";

export default function getTimePerApp(appInfo: { [key: string]: SingleStore }) {
    const result = [];
    for (const key in appInfo) {
        const thisStore = appInfo[key];
        let totalDiff: Duration = Duration.fromObject({});
        for (const store of thisStore.records) {
            const endTime = DateTime.fromSeconds(store.endTime);
            const startTime = DateTime.fromSeconds(store.startTime);
            totalDiff = totalDiff.plus(endTime.diff(startTime, ["hours", "minutes", "seconds"]));
        }
        const appName = generateAppName(thisStore.appInfo);
        const usage = totalDiff.shiftTo("hours").toObject().hours;
        const normalizedDurationDiff = totalDiff.shiftTo("hours", "minutes");
        const hoverLabel = normalizedDurationDiff.hours > 0 ? `${normalizedDurationDiff.hours}h ${parseInt(normalizedDurationDiff.minutes)}m`: `${parseInt(normalizedDurationDiff.minutes)}m`
        if (normalizedDurationDiff.minutes >= 5) {
            result.push({
                app: appName,
                usage: usage,
                hoverLabel: hoverLabel,
                appInfo: thisStore.appInfo
            })
        }
    }
    console.log("calculation done");
    return result;
}
