import {ApplicationInfo} from "../interfaces.ts";

export default function generateTabName(tabInfo: ApplicationInfo) {
    return tabInfo.fileDescription;
}