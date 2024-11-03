const express = require('express');
const findFreePorts = require('find-free-ports');
const {writeFileSync, appendFileSync, readFileSync} = require("node:fs");
const app = express();

const LOG_FILE_NAME = "log.txt";
const CURRENT_SCREENTIME_DATA_FILE_NAME = "current.json";
const TAB_CHANGE_THRESHOLD = 10;

function logMessage(message) {
    const now = new Date();
    appendFileSync(LOG_FILE_NAME, `[${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}] ${message}\n`);
}

function writeToFile(filename, content) {
    writeFileSync(filename, content, (e) => {
        logMessage(`A function error has occurred writing to ${filename}`);
        logMessage(e.message);
    });
}

function storeIsToday(store) {
    const today = new Date();
    return store.year === today.getFullYear() && store.month === today.getMonth() && store.day === screenTimeData.getDate();
}
// TODO: absolute paths?

// initialize store and date
let allStore = null;
const today = new Date();
let tabChanges = 0;

// pre app worker
let screenTimeData;
try {
    screenTimeData = readFileSync(CURRENT_SCREENTIME_DATA_FILE_NAME, "utf8")
} catch (e) {
    logMessage(`An error occurred reading from ${CURRENT_SCREENTIME_DATA_FILE_NAME}`);
    logMessage(e.message);
}
// null check, if exists, continue validation
if (screenTimeData !== "") {
    logMessage("current json is NOT empty, validating date")
    screenTimeData = JSON.parse(screenTimeData);
    // is today, set storage
    if (storeIsToday(screenTimeData)) {
        logMessage("Date is the same, putting contents into current store.");
        allStore = screenTimeData;
    } else {
        // else move that stuff to another file, and clear current file
        logMessage("Date is different, moving it");
        writeFileSync(`${screenTimeData.month}-${screenTimeData.day}-${screenTimeData.year}.json`, JSON.stringify(screenTimeData));
        writeFileSync(CURRENT_SCREENTIME_DATA_FILE_NAME, "");
    }
}

// initialize store if its null (preappworker found no prev file)
if (!allStore) {
    logMessage("Current json is empty, or different day, using default key value store")
    allStore = {day: null, month: null, year: null, screenTimeData: {}}
    allStore.day = today.getDate();
    allStore.month = today.getMonth() + 1;
    allStore.year = today.getFullYear();
}
logMessage("CURRENT VALUE STORE: " + JSON.stringify(allStore));


// start recurreng file write task
setInterval(() => {
    // is still today
    if (storeIsToday(allStore)) {
        writeToFile(CURRENT_SCREENTIME_DATA_FILE_NAME, allStore);
    } else {
        // TODO: fix duplicate code in moving file
        // else move allstore to new file, and reinitialize all store w default
        writeFileSync(`${allStore.month}-${allStore.day}-${allStore.year}.json`, JSON.stringify(allStore));
        allStore = {day: null, month: null, year: null, screenTimeData: {}};
    }
}, 300000) // 5 minutes

app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.get("/new/", (req, res) => {
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const tab = req.body.tab;
    const entry = {startTime: startTime, endTime: endTime};
    tabChanges++;
    // key exists, then append it
    if (allStore.hasOwnProperty(tab)) {
        allStore.screenTimeData[tab].push(entry);
    } else {
        // doesnt exists, create new entry and set as timerange
        allStore.screenTimeData[tab] = [entry];
    }

    // check if should write to file (tab changed num limit reached)
    if (tabChanges >= TAB_CHANGE_THRESHOLD) {
        // is still today
        if (storeIsToday(allStore)) {
            writeToFile(CURRENT_SCREENTIME_DATA_FILE_NAME, allStore);
        } else {
            // else move allstore to new file, and reinitialize all store w default
            writeFileSync(`${allStore.month}-${allStore.day}-${allStore.year}.json`, JSON.stringify(allStore));
            allStore = {day: null, month: null, year: null, screenTimeData: {}};
        }
        writeToFile(CURRENT_SCREENTIME_DATA_FILE_NAME, allStore)
    }
    res.send("");
})

findFreePorts(1).then(port => {
    app.listen(port[0], () => {
        console.log(`Server running at http://localhost:${port}`);
        writeFileSync("port.txt", port[0].toString());
        console.log("Written port to file!");
    })
});