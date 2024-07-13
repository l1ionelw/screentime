import {SingleStore} from "../interfaces.ts";

export default function generateTabTimeline(entries: { [key: string]: SingleStore }) {
    const timeline = [];
    for (const x in entries) {
        const thisStore = entries[x];
        if (Object.keys(thisStore.appInfo).includes("title")) {
            for (const x of thisStore.records) {
                timeline.push({
                    startTime: x.startTime,
                    endTime: x.endTime,
                    tabInfo: thisStore.appInfo
                })
            }
        }
    }
    timeline.sort((a, b) => a.startTime - b.startTime);
    return timeline
}