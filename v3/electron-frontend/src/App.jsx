import {useEffect, useMemo, useState} from "react";
import {DateTime} from "luxon";
import ScreenTimeLogo from "@/assets/ScreenTimeLogo.jsx";
import {useApiPort} from "@/contexts/ApiPortContext.jsx";

export default function App() {
    const [currDate, setCurrDate] = useState(() => DateTime.now().startOf("day"));
    const [screenTimeData, setScreenTimeData] = useState(null);
    const [appsUsed, setAppsUsed] = useState(null);
    const apiPort = useApiPort().apiPort;
    useEffect(() => {
        if (apiPort) fetch(`http://localhost:${apiPort}/filestore/${currDate.year}-${currDate.month}-${currDate.day}.json`).then((data) => {
            if (data.status === 200) {
                console.log("fetched!")
                data.json().then((json) => {
                    setScreenTimeData(json)
                })
            } else {
                setScreenTimeData(null)
            }
        }).catch((error)=>{
            console.log("couldnt fetch")
            console.error(error.message);
        })
    }, [currDate, apiPort]);


    function changeDate(days) {
        setCurrDate(currDate.plus({days: days}));
    }

    if (apiPort === null) return (<h1>Loading</h1>)
    return (
        <>
            <div
                className="flex gap-1 font-medium items-center">
                <ScreenTimeLogo/>
                <a style={{fontSize: "25px"}}>Screen Time</a>
            </div>
            <div className={"ml-3"}>
                <h1>{currDate.toLocaleString(DateTime.DATE_FULL)}</h1>
                <div className={"gap-x-5 flex"}>
                    <button onClick={() => changeDate(-1)}>Previous</button>
                    <button onClick={() => changeDate(1)}>Next</button>
                </div>
                <p>{JSON.stringify(screenTimeData)}</p>
            </div>
        </>
    )
}