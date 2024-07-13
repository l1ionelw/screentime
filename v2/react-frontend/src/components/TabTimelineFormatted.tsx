import {DateTime} from "luxon";

export default function TabTimelineFormatted({entries}) {
    return (
        <div>
            <h2>Website Timeline</h2>
            <p>{entries.length} events</p>
            {entries.map((item) => (
                <p>[{DateTime.fromSeconds(item.startTime).toFormat("hh:mm:ss a")}] <strong>{item.tabInfo.title}</strong> - {item.tabInfo.path}
                </p>
            ))}
        </div>
    )
}