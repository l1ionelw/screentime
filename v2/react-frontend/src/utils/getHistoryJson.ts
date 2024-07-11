import {RequestStatus} from "../interfaces.ts";
import {API_URL} from "../main.tsx";

export default async function getHistoryJson(fileName: string): Promise<RequestStatus> {
    const resp: RequestStatus = {
        status: "Loading",
        response: JSON.parse('{"data":"empty"}')
    };
    await fetch(`${API_URL}/assets/${fileName}`).then((resp) => resp.text()).then((text) => {
        resp.status = "Success";
        resp.response = JSON.parse(text);
    })
    console.log("finished response");
    console.log(resp)
    return resp;
}