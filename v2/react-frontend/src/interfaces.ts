import {DateTime} from "luxon";

export interface ApplicationInfo {
    path: string,
    fileDescription: string
    productName: string
}

export interface TimeRange {
    startTime: number
    endTime: number
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

// Client Interfaces
export interface RequestStatus {
    status: string
    response: RecordsStore
}