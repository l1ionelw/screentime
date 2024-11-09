console.log("extension started!");
const NATIVE_APP_EXTENSION = "com.screentime.port";
let API_PORT = null;
port = chrome.runtime.connectNative(NATIVE_APP_EXTENSION);

function getPort() {
    port.onMessage.addListener((msg) => {
        console.log("Received from native app:", msg);
        API_PORT = msg.port;
    });
    port.onDisconnect.addListener(function () {
        console.log('Disconnected');
      });      
}
getPort();

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