chrome.action.onClicked.addListener(async () => {
    chrome.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
        let tab = tabs[0];

        chrome.windows.create({
            type: "panel",
            url: `popup/popup.html?tabId=${tab.id}`,
            width: 300,
            height: 400,
        });
    }, console.error);
});

chrome.runtime.onMessage.addListener((request) => {
    if (request === "showResults") {
        chrome.windows.create({
            type: "panel",
            url: `results/results.html`,
            width: 300,
            height: 400,
        });
    }
});

// console.log("background.js loaded");
