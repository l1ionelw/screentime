import express from "express";
import {JSON_FILE_PATH, mainAppStore, setWindowSwitches, windowSwitches} from "./globals";
import type {ApplicationInfo, TimeRange} from "./interfaces";
import writeToFile from "./pre-init/writeToFile";

const router = express.Router();
router.get("/", (req, res) => {
    return res.send("api home");
})

router.post("/entry/", (req, res) => {
    setWindowSwitches(windowSwitches + 1);
    let body;
    console.log(req.body);
    try {
        body = typeof req.body === "object" ? req.body : JSON.parse(req.body);
    } catch (e) {
        return res.status(409).send("Unable to parse data.");
    }
    const timeRange: TimeRange = JSON.parse(body["timeRange"]);
    const appInfo: ApplicationInfo = JSON.parse(body["appInfo"]);
    // null check
    if (!appInfo || !timeRange) {
        return res.status(409).send("Incorrect data format");
    }

    // check if app already exists in store
    let appEntry = mainAppStore.entries[appInfo.path];
    if (!appEntry) { // if doesnt exist, init new Application Entry
        appEntry = {appInfo: appInfo, records: []}
    }
    // push value to new entry
    appEntry.records.push(timeRange);
    mainAppStore.entries[appInfo.path] = appEntry;
    mainAppStore.entries[appInfo.path] = appEntry;

    if (windowSwitches >= 5) {
        writeToFile(JSON_FILE_PATH, JSON.stringify(mainAppStore));
        setWindowSwitches(0);
    }
    console.log("\n\n\n\n\n\n\n\n\n\n");
    console.log(appEntry);
    return res.send("Success");
})

module.exports = router