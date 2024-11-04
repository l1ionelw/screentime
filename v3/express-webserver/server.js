const express = require('express');
const findFreePorts = require('find-free-ports');
const { writeFileSync, appendFileSync, readFileSync } = require("node:fs");
var cors = require('cors')
const app = express();
app.use(cors());
app.use(express.json());

const LOG_FILE_NAME = "log.txt";
const CURRENT_SCREENTIME_DATA_FILE_NAME = "current.json";
const TAB_CHANGE_THRESHOLD = 1;
const APP_CHANGE_THRESHOLD = 10;

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
    return store.year === today.getFullYear() && store.month === today.getMonth() + 1 && store.day === today.getDate();
}

// initialize store and date
let allStore = null;
const today = new Date();
let tabChanges = 0;
let appChanges = 0;

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
    const today = new Date();
    allStore = { day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear(), tabHistory: {}, appHistory: {}, tabPairs: {}, appPairs: {} }
}
logMessage("CURRENT VALUE STORE: " + JSON.stringify(allStore));


// start recurring file write task
setInterval(() => {
    // is still today
    if (storeIsToday(allStore)) {
        writeToFile(CURRENT_SCREENTIME_DATA_FILE_NAME, JSON.stringify(allStore));
    } else {
        // TODO: fix duplicate code in moving file
        // else move allstore to new file, and reinitialize all store w default
        writeFileSync(`${allStore.month}-${allStore.day}-${allStore.year}.json`, JSON.stringify(allStore));
        const today = new Date();
        allStore = { day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear(), tabHistory: {}, appHistory: {}, tabPairs: {}, appPairs: {} }
    }
}, 300000) // 5 minutes

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post("/new/tabchange/", (req, res) => {
    const startTime = req.body.startTime; // int timestamp date
    const endTime = req.body.endTime; // int timestamp date
    const tabUrl = req.body.tabUrl; // STRING tab url HOST
    const tabInfo = req.body.tabInfo // JSON tab name, url
    const entry = { startTime: startTime, endTime: endTime };
    console.log(tabInfo);
    tabChanges++;
    // key exists, then append it
    if (allStore.tabHistory.hasOwnProperty(tabUrl)) {
        allStore.tabHistory[tabUrl].push(entry);
    } else {
        // doesnt exists, create new entry and set as timerange
        allStore.tabHistory[tabUrl] = [entry];
    }

    // add pair to tab pair
    if (!allStore.tabPairs.hasOwnProperty(tabUrl)) {
        allStore.tabPairs[tabUrl] = tabInfo;
    }

    // check if should write to file (tab changed num limit reached)
    if (tabChanges >= TAB_CHANGE_THRESHOLD) {
        console.log("writing to file, tab changed threshold reached")
        // is still today
        if (storeIsToday(allStore)) {
            console.log("is today! saving into current json");
            writeToFile(CURRENT_SCREENTIME_DATA_FILE_NAME, JSON.stringify(allStore));
        } else {
            // else move allstore to new file, and reinitialize all store w default
            writeFileSync(`${allStore.month}-${allStore.day}-${allStore.year}.json`, JSON.stringify(allStore));
            const today = new Date();
            allStore = { day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear(), tabHistory: {}, appHistory: {}, tabPairs: {}, appPairs: {} }
        }
    }
    res.send("");
})

app.post("/new/appchange/", (req, res) => {
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const appPath = req.body.appPath // string app path 
    const appInfo = req.body.appInfo // json of app info
    const entry = {startTime: startTime, endTime: endTime};
    appChanges++;
    console.log(appInfo);

    // key exists, then append it
    if (allStore.appHistory.hasOwnProperty(appPath)) {
        allStore.appHistory[appPath].push(entry);
    } else {
        // doesnt exist, create new entry and set as timerange
        allStore.appHistory[appPath] = [entry];
    }

    // add pair to tab pair
    if (!allStore.appPairs.hasOwnProperty(appPath)) {
        allStore.appPairs[appPath] = appInfo;
    }

    // check if should write to file (tab changed num limit reached)
    if (appChanges >= APP_CHANGE_THRESHOLD) {
        // is still today
        if (storeIsToday(allStore)) {
            writeToFile(CURRENT_SCREENTIME_DATA_FILE_NAME, JSON.stringify(allStore));
        } else {
            // else move allstore to new file, and reinitialize all store w default
            writeFileSync(`${allStore.month}-${allStore.day}-${allStore.year}.json`, JSON.stringify(allStore));
            const today = new Date();
            allStore = { day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear(), tabHistory: {}, appHistory: {}, tabPairs: {}, appPairs: {} }
        }
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