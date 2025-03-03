import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useApiPort } from "@/contexts/ApiPortContext.jsx";
import { calculateAppUsageTimes } from "@/utils/calculateAppUsageTimes.js";
import { filterAppUsageTimes } from "@/utils/filterAppUsageTimes.js";
import { convertToChartData } from "@/utils/convertToChartData.js";
import ScreenTimeChart from "@/components/ScreenTimeChart.jsx";
import LoadingScreen from "@/components/LoadingScreen.jsx";
import Settings from "@/components/Settings.jsx";
import DateNavigation from "@/components/DateNavigation.jsx";
import TabNavigation from "@/components/TabNavigation.jsx";
import SortDropdown from "@/components/SortDropdown.jsx";
import AppItem from "@/components/AppItem.jsx";
import ViewToggleButton from "@/components/ViewToggleButton.jsx";
import "./App.css";
import "@/styles.css";
import AppHeader from "./components/Header";

export default function App() {
    const [currDate, setCurrDate] = useState(() => DateTime.now().startOf("day"));
    const [rawJsonData, setRawJsonData] = useState(null);
    const [dataViewMode, setDataViewMode] = useState({ "screenTime": "List", "browserTime": "List" });
    const [selectedTab, setSelectedTab] = useState("Usage");
    const [chartData, setChartData] = useState(null);
    const [sortOption, setSortOption] = useState("Default");
    const apiPort = useApiPort().apiPort;

    useEffect(() => {
        if (apiPort) fetch(`http://localhost:${apiPort}/filestore/${currDate.year}-${currDate.month}-${currDate.day}.json`).then((data) => {
            if (data.status === 200) {
                console.log("fetched!")
                data.json().then((json) => {
                    setRawJsonData(json);
                    calculateChartData(json);
                    // setBrowserScreenTimes(filterBrowserUsageTimes(calculateBrowserUsageTimes(json), 60));
                })
            } else {
                setRawJsonData(null);
                setChartData(null);
            }
        }).catch((error) => {
            console.log("couldnt fetch")
            console.error(error.message);
        })
    }, [currDate, apiPort]);

    useEffect(() => {
        if (chartData !== null) {
            sortData();
        }
    }, [sortOption]);

    function calculateChartData(rawJsonData) {
        const filteredUsageTimes = filterAppUsageTimes(calculateAppUsageTimes(rawJsonData), 60)
        const chartData = convertToChartData(filteredUsageTimes);
        setChartData(chartData);
    }

    function sortData() {
        if (sortOption === "Default") {
            calculateChartData(rawJsonData);
            return;
        }
        // Create an array of objects to hold both labels and data
        const combinedData = chartData.labels.map((label, index) => ({
            label: label,
            value: chartData.data[index],
            paths: chartData.paths[index]
        }));

        if (sortOption === "Greatest") {
            combinedData.sort((a, b) => b.value - a.value);
        } else if (sortOption === "Least") {
            combinedData.sort((a, b) => a.value - b.value);
        }

        let newState = {
            labels: combinedData.map(item => item.label),
            data: combinedData.map(item => item.value),
            paths: combinedData.map(item => item.paths)
        }
        setChartData(newState);
    }

    if (apiPort === null) return <LoadingScreen />;

    return (
        <div className="app-container">
            <AppHeader />

            <main className="app-content">
                <DateNavigation currDate={currDate} setCurrDate={setCurrDate} />
                <TabNavigation selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

                <div className="content-panel">
                    <div className="tab-content">
                        {selectedTab === "Usage" && (
                            <div className="usage-content">
                                <section className="section-content">
                                    <div className="section-header">
                                        <h3 className="section-title">Applications</h3>

                                        <div className="flex-row flex-gap">
                                            <SortDropdown sortOption={sortOption} setSortOption={setSortOption} />
                                            <ViewToggleButton
                                                dataViewMode={dataViewMode}
                                                setDataViewMode={setDataViewMode}
                                                viewType="screenTime"
                                            />
                                        </div>
                                    </div>

                                    <div className="section-content">
                                        {dataViewMode.screenTime === "Bar" &&
                                            <ScreenTimeChart
                                                data={chartData}
                                                title="Application Screen Time"
                                                datasetLabel="Screen Time (seconds)"
                                                borderColor="rgba(129, 199, 132, 0.7)"
                                            />
                                        }

                                        {dataViewMode.screenTime === "List" && (
                                            <div className="app-list">
                                                {chartData !== null && chartData.labels !== null && chartData.labels.length > 0 ? (
                                                    chartData.labels.map((appName, index) => (
                                                        <AppItem
                                                            key={appName}
                                                            appName={appName}
                                                            usage={chartData.data[index]}
                                                            path={chartData.paths[index]}
                                                        />
                                                    ))
                                                ) : (
                                                    <div className="no-data-message">
                                                        No application data available
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}
                        {selectedTab === "Settings" && (
                            <Settings />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}