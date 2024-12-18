import fs from "fs";
import {JSON_FILE_DIR, JSON_FILE_PATH} from "../globals";
import getCurrentIsoDate from "./getCurrentIsoDate";
import {RecordsStore} from "../interfaces";
import {DateTime} from "luxon";
import writeToFile from "./writeToFile";
import path from "path";

// checks if json date is today, then sets global json values as this array. Used on server initialization and per file write check
export default function loadJson() {
    console.log("Loading json from file");
    // default empty store
    let mainAppStore: RecordsStore = {
        date: DateTime.now().toISODate().toString(),
        entries: {}
    }
    // check if current.json date is today
    const data = fs.readFileSync(JSON_FILE_PATH, {encoding: 'utf8', flag: 'r'})
    const parsedData = JSON.parse(data);
    if (parsedData.date === getCurrentIsoDate()) {
        console.log("current.json already has saved timestamps, loading from file");
        mainAppStore.entries = parsedData.entries;
    } else {
        writeToFile(path.join(JSON_FILE_DIR, `${parsedData.date}.json`), data)
    }
    return mainAppStore;
}