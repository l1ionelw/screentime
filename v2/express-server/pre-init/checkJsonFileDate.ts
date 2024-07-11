import * as fs from "fs";
import {JSON_FILE_DIR, JSON_FILE_PATH, mainAppStore} from "../globals";
import {RecordsStore} from "../interfaces";
import getCurrentIsoDate from "./getCurrentIsoDate";
import writeToFile from "./writeToFile";
import path from "path";

// this is only run on app init

export default function checkJsonFileDate() {
    console.log("checking json file dates");
    const data = fs.readFileSync(JSON_FILE_PATH, {encoding: 'utf8', flag: 'r'})
    let fileRecords: RecordsStore = JSON.parse(data);
    if (fileRecords.date != getCurrentIsoDate()) {
        console.log("file logs doesn't match!");
        // write file records to new file
        const lastDateFileName = path.join(JSON_FILE_DIR, `${fileRecords.date}.json`);
        writeToFile(lastDateFileName, JSON.stringify(fileRecords));
        // writes an empty app store (app initialization has empty store)
        writeToFile(JSON_FILE_PATH, JSON.stringify(mainAppStore));
    }
}