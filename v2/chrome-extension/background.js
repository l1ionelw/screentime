console.log("script init");
let tabInfo = {
    title: "",
    url: "",
}
chrome.tabs.onActivated.addListener((tab) => {
    console.log("Tab changed");
    getCurrentTab((thisTab) => {
        tabInfo = {
            title: thisTab.title,
            url: thisTab.url
        }
        console.log(tabInfo);
    })
});

function getCurrentTab(callback) {
    let queryOptions = {active: true, lastFocusedWindow: true};
    chrome.tabs.query(queryOptions, ([tab]) => {
        if (chrome.runtime.lastError)
            console.error(chrome.runtime.lastError);
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        callback(tab);
    });
}