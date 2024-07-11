import writeToFile from "./writeToFile";
import {JSON_FILE_PATH, mainAppStore} from "../globals";
import getCurrentIsoDate from "./getCurrentIsoDate";
import checkJsonFileDate from "./checkJsonFileDate";

export default function timedStorageWriter() {
    setInterval(()=> {
        console.log("interval ran");
        if (getCurrentIsoDate() !== mainAppStore.date) {
            checkJsonFileDate();
        }
        writeToFile(JSON_FILE_PATH, JSON.stringify(mainAppStore));
    }, 300000) // 5 minutes
}