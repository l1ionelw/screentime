console.log("screentime extension online, waiting to nuke this tab");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "show_screentime_limit_reached") {
    console.log("showing screentime limit reached");
    document.querySelector("body").innerHTML = "<div><h1>The screen time for this website has been reached</h1><p>Please contact your inner self for something better to do.</p></div>"
  }
  return true;
});