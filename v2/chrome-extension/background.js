var API_URL = "http://localhost:52879";

let lastWindowState = 0
let currentTab;
let startTime;
let endTime;
let tabRecords = {};
init()

function init() {
    getCurrentTab().then(resp => {
        currentTab = resp;
        console.log(currentTab);
    });
    startTime = newDateSeconds();
}

chrome.tabs.onActivated.addListener(async (tabIdObject) => {
    // focused on a new tab
    console.log("tab activated");
    tabChangedHandler().then(() => console.log(tabRecords));
})
chrome.tabs.onUpdated.addListener(async (tabId) => {
    // tab updated
    console.log("tab updated");
    tabChangedHandler().then(() => console.log(tabRecords));
})

chrome.windows.onFocusChanged.addListener(async (windowState) => {
    // window focus changed
    console.log("window changed");
    if (windowState === -1) {
        console.log("lost focus");
        await tabChangedHandler().then(() => console.log(tabRecords));
        currentTab = null;
    }
    if (lastWindowState === -1) {
        console.log("recovered from minimized window");
        init();
    }
    lastWindowState = windowState;
})


async function tabChangedHandler() {
    endTime = newDateSeconds();
    if (currentTab === null) {
        return
    }
    if (endTime - startTime < 3) {
        return
    }

    let timeRange = {
        startTime: startTime,
        endTime: endTime
    }
    const tabUrl = currentTab.url;
    const tabInfo = { path: tabUrl, title: currentTab.title };

    if (!tabRecords[tabUrl]) {
        tabRecords[tabUrl] = { entries: [], tabInfo: tabInfo }
    }

    currentTab = await getCurrentTab();
    tabRecords[tabUrl].entries.push(timeRange);
    await sendApiRequest(tabInfo, timeRange);
    startTime = endTime;
}

async function sendApiRequest(tabInfo, timeRangeEntry) {
    console.log(tabInfo);
    console.log(timeRangeEntry);
    await fetch(`${API_URL}/api/entry/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ appInfo: tabInfo, timeRange: timeRangeEntry })
    }).then(resp => resp.text()).then(text => console.log(text))
}

function newDateSeconds(date) {
    return Math.round(Date.now() / 1000)
}

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}


async function generateApiUrl() {
    let server_port = await fetch(chrome.runtime.getURL("server_port.env"));
    server_port = server_port ? server_port : 5000;
    console.log("api server port: ", server_port);
    return `http://localhost:${server_port}`
}