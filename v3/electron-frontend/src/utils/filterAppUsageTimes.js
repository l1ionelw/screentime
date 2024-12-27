export function filterAppUsageTimes(appScreenTimeStore, thresholdSeconds) {
    const filteredScreenTimeStore = [];
    for (let x of appScreenTimeStore) {
        if (x.usage > thresholdSeconds) {
            filteredScreenTimeStore.push(x);
        }
    }
    console.log(filteredScreenTimeStore);
    return filteredScreenTimeStore;
}