import {DateTime} from "luxon";

export interface ApplicationInfo {
    path: string,
    fileDescription: string
    productName: string
}

export interface TimeRange {
    startTime: DateTime
    endTime: DateTime
}

export interface SingleStore {
    appInfo: ApplicationInfo
    records: TimeRange[]
}

export interface RecordsStore {
    date: string
    entries: {
        [key: string]: SingleStore
    }
}
