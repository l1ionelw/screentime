export function formatUsageLimitString(appLimitString) {
    const splitString = appLimitString.split("|");
    const hoursInt = parseInt(splitString[0]);
    const minutesInt = parseInt(splitString[1]);
    let toReturn = "";
    if (hoursInt > 0) toReturn += `${hoursInt}h `;
    if (minutesInt > 0) toReturn += `${minutesInt}m `;
    return toReturn;
}