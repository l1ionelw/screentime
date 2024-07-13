import {DateTime} from "luxon";

export default function AppTimelineFormatted({timeline, showStartEndRange}) {
    return (
        <div>
            <h2>App Timeline</h2>
            <p>{timeline.length} events</p>
            {!showStartEndRange && timeline.map((item) => (
                <p>[{DateTime.fromSeconds(item.startTime).toFormat("hh:mm:ss a")}] {item.app}</p>
            ))}
            {showStartEndRange && timeline.map((item) => (
                <p>[{DateTime.fromSeconds(item.startTime).toFormat("hh:mm:ss a")} - {DateTime.fromSeconds(item.endTime).toFormat("hh:mm:ss a")}] {item.app}</p>
            ))}
        </div>
    )
}