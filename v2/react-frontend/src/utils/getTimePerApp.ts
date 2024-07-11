import {SingleStore} from "../interfaces.ts";
import {DateTime, Duration} from "luxon";

export default function getTimePerApp(appInfo: { [key: string]: SingleStore }) {
    const result = [];
    console.log("calculating time per app");
    console.log("lsadkjfslda")
    console.log(appInfo);

    for (const key in appInfo) {
        const thisStore = appInfo[key];
        let totalDiff: Duration = Duration.fromObject({hour: 0});
        for (const store of thisStore.records) {
            console.log("each store inside records");
            console.log(store)
            const endTime = DateTime.fromSeconds(store.endTime);
            const startTime = DateTime.fromSeconds(store.startTime);
            totalDiff = totalDiff.plus(endTime.diff(startTime, ["hours", "minutes", "seconds"]));
        }
        result.push({app: thisStore.appInfo.fileDescription,usage: totalDiff.shiftTo("hours").toObject().hours, hoverLabel: `${totalDiff.hours}h ${totalDiff.minutes}m ${totalDiff.seconds}s`})
    }
    console.log("calculation done");
    return result;
}
