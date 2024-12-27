let API_PORT = null;
let WEB_LIMITS = {};

async function findOpenPort(startPort = 6125, endPort = 6135) {
    let openPort = null;
    // TODO: add a timeout on this

    for (let port = startPort; port <= endPort; port++) {
        try {
            // Attempt to fetch from each port
            const response = await fetch(`http://localhost:${port}`).catch(e => console.log(e.message));
            console.log("checking port " + port);
            // Check if the response is successful
            if (response.ok) {
                const text = await response.text();
                if (text === "Screentime API!") {
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
async function getWebLimits() {
    if (API_PORT === null) return {};
    fetch(`http://localhost:${API_PORT}/limits/`).then(async (response) => {
        if (response.status !== 200) return;
        const limits = await response.json();
        WEB_LIMITS = JSON.parse(limits).websiteLimits;
    }).catch((exception) => {
        console.log("error when trying to fetch app limits");
        console.log(exception.message);
    }
    )
}
async function screentimeCheck() {
    // runs inside tabchanged handler, before sending request AND as a timed interval
    // return boolean on if time limit passed or not
    const currentSite = await getCurrentTab();

    if (!currentSite || currentSite === null || !currentSite.hasOwnProperty("url") || !currentSite.url || currentSite.url === null) return false;
    console.log(currentSite);
    const currentSiteNoProtocol = new URL(currentSite.url).hostname;
    console.log(currentSiteNoProtocol);
    if (!WEB_LIMITS.hasOwnProperty(currentSiteNoProtocol)) {
        console.log("doesnt have screen time");
        return;
    }
    console.log("has screen time, checking");
    const timeSplit = WEB_LIMITS[currentSiteNoProtocol].split("|");
    const limitSeconds = (timeSplit[0] * 3600) + (timeSplit[1] * 60);
    const current_usage = 0;
    // fetch from current store
    let usage = 0;
    await fetch(`http://localhost:${API_PORT}/store/`).then(async (response) => {
        if (response.status !== 200) return;
        let allStore = await response.json();
        allStore = allStore.tabHistory;
        usage = calculateUsageSeconds(allStore, currentSiteNoProtocol);
    });
    console.log("FETCH IS DONE");
    console.log(usage);
    console.log(limitSeconds);
    if (usage >= limitSeconds) {
        chrome.tabs.sendMessage(currentSite.id, { action: "show_screentime_limit_reached" }, () => console.log("message shown!"));
    }
}
setInterval(screentimeCheck, 10000);

function calculateUsageSeconds(allStore, appUrlHostname) {
    let usage = 0;
    if (!allStore.hasOwnProperty(appUrlHostname)) return 0;
    for (var x of allStore[appUrlHostname]) {
        const timeSplit = x.split("|");
        usage += (timeSplit[1] - timeSplit[0]);
    }
    return usage;
}
findOpenPort().then(openPort => {
    if (openPort) {
        console.log(`The first open port found is: ${openPort}`);
        API_PORT = openPort;
        getWebLimits();
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
    const tabUrl = new URL(prev_tab.url)?.hostname;
    const tabInfo = { path: tabUrl, title: prev_tab.title };
    await sendApiRequest(tabInfo, calc_startTime, calc_endtime);
    screentimeCheck();
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