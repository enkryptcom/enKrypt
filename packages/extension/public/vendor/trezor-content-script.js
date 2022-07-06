let port = chrome.runtime.connect({ name: "trezor-connect" });
port.onMessage.addListener((message) => {
  console.log(message);
  window.postMessage(message, window.location.origin);
});
port.onDisconnect.addListener((d) => {
  port = null;
});

/*
Passing messages from popup to background script
*/

window.addEventListener("message", (event) => {
  console.log(event.data);
  if (port && event.source === window && event.data) {
    port.postMessage({ data: event.data });
  }
});
