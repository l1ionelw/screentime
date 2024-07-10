interface ApplicationInfo {
    path: string,
    fileDescription: string
    productName: string
}

interface TimeRange {
    startTime: luxon.DateTime
    endTime: luxon.DateTime
}

interface SingleStore {
    appInfo: ApplicationInfo
    records: TimeRange[]
}

interface RecordsStore {
    date: string
    entries: {
        [key: string]: SingleStore
    }
}
