import {DateTime} from "luxon";

export function calculateBrowserUsageTimes(allStore) {
    let appTimes = [];
    if (!allStore) return appTimes;
    for (let tabPath in allStore["tabHistory"]) {
        let appToAppend = {
            tab: allStore["tabPairs"][tabPath].title,
            path: tabPath,
            usage: 0
        }
        for (let timesList of allStore["tabHistory"][tabPath]) {
            const times = timesList.split("|");
            const startTime = DateTime.fromSeconds(parseInt(times[0]));
            const endTime = DateTime.fromSeconds(parseInt(times[1]));
            const timeElapsedSeconds = endTime.diff(startTime, ["seconds"]).seconds;
            appToAppend.usage += timeElapsedSeconds;
        }
        appTimes.push(appToAppend);
    }

    return appTimes;
}