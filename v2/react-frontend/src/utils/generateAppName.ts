import {ApplicationInfo} from "../interfaces.ts";

export default function generateAppName(appInfo: ApplicationInfo) {
    return appInfo.fileDescription !== "" ? appInfo.fileDescription : appInfo.path?.replace(/^.*[\\/]/, '');
}