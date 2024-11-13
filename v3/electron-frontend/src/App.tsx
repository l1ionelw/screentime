import './App.css'
import {useEffect, useState} from "react";
import {DateTime} from "luxon";

function App() {
    const [currentDay, setCurrentDay] = useState(DateTime.now().startOf("day"));
    const [data, setData] = useState(getData(currentDay));
    useEffect(() => {
        setData(getData(currentDay));
    }, [currentDay]);
    // useMemo(() => {
    //     setData(getData(currentDay));
    // }, [currentDay]);

    function getData(date: DateTime) {
        console.log("getting data!");
        // is today, fetch from server
        if (date.equals(DateTime.now().startOf("day"))) {
            fetch("http://localhost:6125/store/").then(async (response) => {
                const json = await response.json();
                console.log(json);
            })
            return "isToday";
        }
        // is not today, read from file
        return "isNotToday";
    }

    return (
        <>
            <div style={{display: "flex", gap: "10px"}}>
                <button onClick={() => setCurrentDay(currentDay.minus({days: 1}))}>Previous</button>
                <button onClick={() => setCurrentDay(currentDay.plus({days: 1}))}>Next</button>
            </div>

            <h1>{currentDay.toString()}</h1>
            <h1>{data.toString()}</h1>
        </>
    )
}

export default App
