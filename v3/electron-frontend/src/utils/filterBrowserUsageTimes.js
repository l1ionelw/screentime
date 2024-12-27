export function filterBrowserUsageTimes(browserTimes, thresholdSeconds) {
    const filteredScreenTimeStore = [];
    for (let x of browserTimes) {
        if (x.tab === null || x.app === "" || x.path === "UNKNOWN_TAB") continue;
        if (x.usage > thresholdSeconds) {
            filteredScreenTimeStore.push(x);
        }
    }
    return filteredScreenTimeStore;
}