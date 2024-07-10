import {RecordsStore} from "./interfaces";
import {DateTime} from "luxon";

export const JSON_FILE_PATH = "assets\\current.json";
export const JSON_FILE_DIR = "assets";
export let mainAppStore: RecordsStore = {
    date: DateTime.now().toISODate().toString(),
    entries: {}
}

export let windowSwitches = 0;

export function setWindowSwitches(num: number) {
    windowSwitches = num;
}