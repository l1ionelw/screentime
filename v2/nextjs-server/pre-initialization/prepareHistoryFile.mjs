const fs = require("fs")
import {JSON_FILE_PATH, mainAppStore} from "@/globals";

export function prepareHistoryFile() {
    console.log("Preparing history file");
    console.log("Checking if file exists");
    if (!fs.existsSync(JSON_FILE_PATH)) {
        console.log("File doesn't exist");
        try {
            fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(mainAppStore))
        } catch (err) {
            console.log("An error occurred while writing to file: ", err);
        }
        return
    }
}
