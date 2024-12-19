import './App.css'
import {useEffect, useState} from "react";
import {DateTime} from "luxon";

function AppOld() {
    const [errorMessage, setErrorMessage] = useState("");
    const [currentDay, setCurrentDay] = useState(DateTime.now().startOf("day"));
    const [screenTime, setScreenTime] = useState({});
    useEffect(() => {
        getData(currentDay);
    }, [currentDay]);

    function getData(date) {
        setErrorMessage("");
        setScreenTime("");
        // is today, fetch from server
        if (date.equals(DateTime.now().startOf("day"))) {
            fetch("http://localhost:6126/store/").then(async (response) => {
                const json = await response.json();
                setScreenTime(json);
            })
            return;
        }
        // is not today, read from file
        window.api.readFile(generateFilename(date)).then((data) => {
            setScreenTime(JSON.parse(data));
        }).catch((err) => {
            console.error(err);
            setErrorMessage(err.message);
        })
    }

    function generateFilename(date) {
        return `${date.month}-${date.day}-${date.year}.json`;
    }

    return (
        <>
            <div style={{display: "flex", gap: "10px"}}>
                <button onClick={() => setCurrentDay(currentDay.minus({days: 1}))}>Previous</button>
                <button onClick={() => setCurrentDay(currentDay.plus({days: 1}))}>Next</button>
            </div>

            <h1>{currentDay.toString()}</h1>
            <p>{screenTime !== "" ? JSON.stringify(screenTime) : "No data"}</p>
            {errorMessage && <>
                <h1>Error</h1>
                <p>{errorMessage}</p>
            </>
            }
        </>
    )
}

export default AppOld
