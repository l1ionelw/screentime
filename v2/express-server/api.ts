import express from "express";
import {JSON_FILE_PATH, mainAppStore, setWindowSwitches, windowSwitches} from "./globals";
import type {ApplicationInfo, TimeRange} from "./interfaces";
import writeToFile from "./pre-init/writeToFile";
import checkAndWriteFile from "./pre-init/checkAndWriteFIle";

const router = express.Router();
router.get("/", (req, res) => {
    return res.send("api home");
})

router.post("/entry/", (req, res) => {
    setWindowSwitches(windowSwitches + 1);
    let body;
    try {
        body = typeof req.body === "object" ? req.body : JSON.parse(req.body);
    } catch (e) {
        return res.status(409).send("Unable to parse data.");
    }
    const timeRange: TimeRange = typeof body["timeRange"] !== "object" ? JSON.parse(body["timeRange"]) : body["timeRange"];
    const appInfo: ApplicationInfo = typeof body["appInfo"] !== "object" ? JSON.parse(body["appInfo"]) : body["appInfo"];
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
        checkAndWriteFile();
        setWindowSwitches(0);
    }
    console.log("\n\n\n");
    console.log(appEntry.appInfo);
    return res.send("Success");
})

router.post("/history/get/", (req, res) => {

})

module.exports = router