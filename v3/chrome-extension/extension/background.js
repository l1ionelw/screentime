console.log("extension started!");
const NATIVE_APP_EXTENSION = "com.screentime.port";
let API_PORT = null;
let got_port = false;
port = chrome.runtime.connectNative(NATIVE_APP_EXTENSION);

function getPort() {
    port.onMessage.addListener((msg) => {
        console.log("Received from native app:", msg);
        API_PORT = msg.port;
        got_port = true;
    });
}