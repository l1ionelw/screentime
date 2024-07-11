import {DateTime} from "luxon";

export default function getCurrentIsoDate() {
    return DateTime.now().toISODate().toString();
}
