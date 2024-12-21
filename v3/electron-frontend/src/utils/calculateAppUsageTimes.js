import {DateTime} from "luxon";

export function calculateAppUsageTimes(allStore) {
    console.log("calculating app usage times");
    let appTimes = [];
    if (!allStore) return appTimes;
    for (let appPath in allStore["appHistory"]) {
        let appToAppend = {app: allStore["appPairs"][appPath].fileDescription, usage: 0}
        for (let timesList of allStore["appHistory"][appPath]) {
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