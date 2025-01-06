import {useContext, useState} from "react";
import {useApiPort} from "@/contexts/ApiPortContext.jsx";

export default function AddScreenTimeLimit({type, selection, limit}) {
    const apiPort = useApiPort().apiPort;
    const [currSelection, setCurrSelection] = useState(() => selection ?? "");
    const [currLimitHours, setCurrLimitHours] = useState(parseInt(limit.split("|")[0]));
    const [currLimitMinutes, setCurrLimitMinutes] = useState(parseInt(limit.split("|")[1]));

    function handleSubmit() {
        const body = {
            type: type,
            path: currSelection.name,
            allowHours: currLimitHours,
            allowMinutes: currLimitMinutes
        };
        console.log(body);
        fetch(`http://localhost:${apiPort}/limits/add/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        }).then((response) => {
            console.log(response.status);
            console.log(response.statusMessage);
            console.log(response.text());
            if (response.status !== 200) {
                console.log("Error adding limit");
                return;
            }
            console.log("success adding limit")
        })
    }

    return (
        <div>
            {type === "App" && <div>
                <label for="selection">Choose your app</label>
                <input type="file" id="selection" name="selection" accept=".exe"
                       onChange={(e) => setCurrSelection(e.target.files[0])}/>
                <br/>
                <label htmlFor={"limitHours"}>Hours</label>
                <input type="number" id="limitHours" name="limitHours"
                       onChange={(e) => setCurrLimitHours(e.target.value)}/>
                <br/>
                <label htmlFor={"limitMinutes"}>Minutes</label>
                <input type="number" id="limitMinutes" name="limitMinutes"
                       onChange={(e) => setCurrLimitMinutes(e.target.value)}/>
                <input type={"submit"} onClick={handleSubmit}/>
            </div>}
            {type === "Website" && <div>
                <label htmlFor="selection">Choose your website</label>
                <input type="text" id="selection" name="selection"
                       onChange={(e) => setCurrSelection(e.target.value)}/>
                <br/>
                <label htmlFor={"limitHours"}>Hours</label>
                <input type="number" id="limitHours" name="limitHours"
                       onChange={(e) => setCurrLimitHours(e.target.value)}/>
                <br/>
                <label htmlFor={"limitMinutes"}>Minutes</label>
                <input type="number" id="limitMinutes" name="limitMinutes"
                       onChange={(e) => setCurrLimitMinutes(e.target.value)}/>
                <input type={"submit"} onClick={handleSubmit}/>
            </div>}
        </div>
    )
}