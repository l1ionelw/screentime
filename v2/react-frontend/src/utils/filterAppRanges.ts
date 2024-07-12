import {SingleStore, TimeRange} from "../interfaces.ts";
import {DateTime} from "luxon";

// filters timeranges less than 5 seconds of change
export default function filterAppRanges(appInfo: { [key: string]: SingleStore }) {
    console.log("FILTERING APP RANGES");
    const updatedInfoStore: { [key: string]: SingleStore } = {};
    for (const key in appInfo) {
        const thisStore = appInfo[key];
        const records = thisStore.records;
        const updatedRecords: TimeRange[] = []
        for (const x of records) {
            const startTime = DateTime.fromSeconds(x.startTime);
            const endTime = DateTime.fromSeconds(x.endTime);
            const diffSeconds = endTime.diff(startTime, ["seconds"]).seconds;
            if (diffSeconds >= 5) {
                updatedRecords.push(x);
            }
        }
        if (updatedRecords.length !== 0) {
            updatedInfoStore[key] = {
                appInfo: thisStore.appInfo,
                records: updatedRecords
            };
        }
    }
    return updatedInfoStore
}