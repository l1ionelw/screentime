// turn entries:singlestore into ordered list of all dates
import {SingleStore} from "../interfaces.ts";
import generateAppName from "./generateAppName.ts";
import filterAppRanges from "./filterAppRanges.ts";

export default function setAppOrdered(entries: { [key: string]: SingleStore }, filterRanges: boolean) {
    if (filterRanges) entries = filterAppRanges(entries);
    console.log("Creating ordered app history list")
    const totalAppTimeRange = []
    for (const key in entries) {
        const thisStore = entries[key];
        const appName = generateAppName(thisStore.appInfo);
        for (const timerange of thisStore.records) {
            timerange["app"] = appName;
            totalAppTimeRange.push(timerange);
        }
    }
    totalAppTimeRange.sort((a, b) => a.startTime - b.startTime);
    return totalAppTimeRange;
}