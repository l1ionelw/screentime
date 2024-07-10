import {Request, Response} from 'express';
import {mainAppStore} from "@/globals";

export default function handler(req: Request, res: Response) {
    if (req.method !== 'POST') {
        res.status(405).send({message: 'Method Disallowed'})
        return
    }
    let body;
    try {
        body = typeof req.body === "object" ? req.body : JSON.parse(req.body);
    } catch (e) {
        return res.status(409).send("Unable to parse data.");
    }
    const timeRange: TimeRange = body["timeRange"]
    const appInfo: ApplicationInfo = body["appInfo"];
    // null check
    if (!appInfo || !timeRange) {
        return res.status(409).send("Incorrect data format");
    }

    // check if app already exists in store
    let appEntry = mainAppStore.entries[appInfo.path];
    if (!appEntry) { // if doesnt exist, init new Application Entry
        appEntry = {appInfo: appInfo, records: []}
    }
    // push value to new entry
    appEntry.records.push(timeRange);
    console.log(appEntry);
    mainAppStore.entries[appInfo.path] = appEntry;
    mainAppStore.entries[appInfo.path] = appEntry;
    return res.send("Success");
}