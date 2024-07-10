import writeToFile from "./writeToFile";
import {JSON_FILE_PATH, mainAppStore} from "../globals";

export default function timedStorageWriter() {
    setInterval(()=> {
        console.log("interval ran");
        writeToFile(JSON_FILE_PATH, JSON.stringify(mainAppStore));
    }, 300000) // 5 minutes
}