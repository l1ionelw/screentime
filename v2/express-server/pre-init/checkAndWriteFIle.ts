// higher level writeFile which checks json date before writing
import fs from "fs";
import {JSON_FILE_PATH, mainAppStore, reloadStore} from "../globals";
import getCurrentIsoDate from "./getCurrentIsoDate";
import writeToFile from "./writeToFile";

export default function checkAndWriteFile() {
    console.log("checking file")
    const data = fs.readFileSync(JSON_FILE_PATH, {encoding: 'utf8', flag: 'r'})
    const parsedData = JSON.parse(data);
    if (parsedData.date !== getCurrentIsoDate()) {
        console.log("date is not equal to today")
        reloadStore();
    } else {
        writeToFile(JSON_FILE_PATH, JSON.stringify(mainAppStore));
    }
}