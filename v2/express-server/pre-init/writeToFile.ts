import * as fs from "fs";
import createDir from "./createDir";
import {JSON_FILE_DIR} from "../globals";

export default function writeToFile(filePath: string, contents: string) {
    console.log("Writing to file");
    try {
        createDir(JSON_FILE_DIR);
        fs.writeFileSync(filePath, contents);
    } catch (err) {
        console.log("An error occurred inside write to file: ", err);
    }
}