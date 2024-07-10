import {DateTime} from "luxon";

export const JSON_FILE_PATH = "assets\\current.json";
export let mainAppStore: RecordsStore = {
    date: DateTime.now().toISODate().toString(),
    entries: {}
}

module.exports = {JSON_FILE_PATH, mainAppStore}