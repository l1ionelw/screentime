import {Duration} from "luxon";

export function secondsFormatter(seconds) {
    const durationSeparator = Duration.fromObject({seconds: seconds}).toFormat("hh:mm:ss").split(":")
    let formattedString = "";
    formattedString += parseInt(durationSeparator[0]) !== 0 ? `${durationSeparator[0]}h `: "";
    formattedString += parseInt(durationSeparator[1]) !== 0 ? `${durationSeparator[1]}m `: "";
    formattedString += parseInt(durationSeparator[2]) !== 0 ? `${durationSeparator[2]}s`: "";
    return formattedString;
}