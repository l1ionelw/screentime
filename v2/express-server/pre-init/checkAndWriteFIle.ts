// higher level writeFile which checks json date before writing
import fs from "fs";
import {JSON_FILE_PATH, mainAppStore, reloadStore} from "../globals";
import getCurrentIsoDate from "./getCurrentIsoDate";
import writeToFile from "./writeToFile";
import loadJson from "./loadJson";

export default function checkAndWriteFile() {
    const data = fs.readFileSync(JSON_FILE_PATH, {encoding: 'utf8', flag: 'r'})
    const parsedData = JSON.parse(data);
    if (parsedData.date !== getCurrentIsoDate()) {
        // if dates are not the same, write mainappstore to current.json
        writeToFile(JSON_FILE_PATH, JSON.stringify(mainAppStore));
        // run loadJson to clear json state and write to another file
        reloadStore();
    } else {
        writeToFile(JSON_FILE_PATH, JSON.stringify(mainAppStore));
    }
}