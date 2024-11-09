let API_PORT = null;
async function findOpenPort(startPort = 6125, endPort = 6135) {
    let openPort = null;
    // TODO: add a timeout on this

    for (let port = startPort; port <= endPort; port++) {
        try {
            // Attempt to fetch from each port
            const response = await fetch(`http://localhost:${port}`);
            console.log("checking port " + port);
            // Check if the response is successful
            if (response.ok) {
                const text = await response.text();
                if (text === "Screentime server online!") {
                    openPort = port;
                    console.log(`Open port found: ${openPort}`);
                    break;  // Exit the loop if an open port is found
                }

            }
        } catch (error) {
            // Ignore errors and continue to the next port
            continue;
        }
    }

    if (openPort === null) {
        console.log("No open ports found in the specified range.");
    }

    return openPort;  // Return the open port or null if none were found
}
findOpenPort().then(openPort => {
    if (openPort) {
        console.log(`The first open port found is: ${openPort}`);
        API_PORT = openPort;
    } else {
        console.log("No open ports were found.");
    }
});

console.log("STARTING EXTENSION");

let lastWindowState = 0
let currentTab;
let startTime;
let endTime;

function init() {
    getCurrentTab().then(resp => {
        currentTab = resp;
        console.log(currentTab);
    });
    startTime = newDateSeconds();
}
init();

chrome.tabs.onActivated.addListener(async (tabIdObject) => {
    // focused on a new tab
    console.log("tab activated");
    tabChangedHandler();
})
chrome.tabs.onUpdated.addListener(async (tabId) => {
    // tab updated
    console.log("tab updated");
    tabChangedHandler();
})

chrome.windows.onFocusChanged.addListener(async (windowState) => {
    // window focus changed
    console.log("window changed");
    if (windowState === -1) {
        console.log("lost focus");
        await tabChangedHandler();
        currentTab = null;
    }
    if (lastWindowState === -1) {
        console.log("recovered from minimized window");
        init();
    }
    lastWindowState = windowState;
})


async function tabChangedHandler() {
    console.log(API_PORT);
    endTime = newDateSeconds();
    // data associated with the OLD tab
    const calc_endtime = endTime;
    const calc_startTime = startTime;
    const prev_tab = currentTab ?? { url: "UNKNOWN_TAB", title: "UNKNOWN TAB" };
    // update start time for NEW TAB
    startTime = endTime;
    currentTab = await getCurrentTab();

    // decide if we need to process the old tab
    // TODO: this might cause issues
    if (calc_endtime - calc_startTime <= 1) {
        console.log("ignored");
        return;
    }
    const tabUrl = prev_tab.url;
    const tabInfo = { path: tabUrl, title: prev_tab.title };

    await sendApiRequest(tabInfo, calc_startTime, calc_endtime);
}

async function sendApiRequest(tabInfo, startTime, endTime) {
    console.log("API REQUEST INFO, PREV TAB");
    console.log({ startTime: startTime, endTime: endTime, tabUrl: tabInfo.path, tabInfo: tabInfo });
    await fetch(`http://localhost:${API_PORT}/new/tabchange/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ startTime: startTime, endTime: endTime, tabUrl: tabInfo.path, tabInfo: tabInfo })
    }).then(resp => resp.text()).then(text => console.log(text)).catch((e) => {
        console.log(e.message);
    })
}

function newDateSeconds() {
    return Math.round(Date.now() / 1000)
}

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}