import {DateTime} from "luxon";

export function calculateAppUsageTimes(allStore) {
    let appTimes = [];
    if (!allStore) return appTimes;
    for (let appPath in allStore["appHistory"]) {
        let appToAppend = {
            app: allStore["appPairs"][appPath].fileDescription,
            path: appPath,
            usage: 0
        }
        const usageList = [];
        for (let timesList of allStore["appHistory"][appPath]) {
            const times = timesList.split("|");
            const startTime = DateTime.fromSeconds(parseInt(times[0]));
            const endTime = DateTime.fromSeconds(parseInt(times[1]));
            const timeElapsedSeconds = endTime.diff(startTime, ["seconds"]).seconds;
            // const timeElapsedSeconds = (endTime - startTime)/1000;
            appToAppend.usage += timeElapsedSeconds;
            usageList.push(timeElapsedSeconds);
        }
        console.log(appToAppend);
        console.log(usageList);
        removeConsecutiveDuplicates(usageList);
        appTimes.push(appToAppend);
    }
    return appTimes;
}

function removeConsecutiveDuplicates(usageList) {
    let removedDuplicates = [usageList[0]];
    let curNumber = usageList[0];
    for (let i = 1; i < usageList.length; i++) {
        const thisComp = usageList[i];
        if (thisComp !== curNumber) {
            removedDuplicates.push(thisComp);
            curNumber = thisComp;
        }
    }
    console.log(removedDuplicates);
    let newTotal = 0;
    for (let x of removedDuplicates) {
        newTotal += x;
    }
    console.log("NEW TOTAL");
    console.log(newTotal);
    return removedDuplicates;
}