import {RecordsStore} from "./interfaces";
import path from "path";
import loadJson from "./pre-init/loadJson";

export const JSON_FILE_PATH = path.join(__dirname, path.join("assets", "current.json"));
export const JSON_FILE_DIR = path.join(__dirname, "assets");
export let mainAppStore: RecordsStore = loadJson();

export let windowSwitches = 0;

export function setWindowSwitches(num: number) {
    windowSwitches = num;
}