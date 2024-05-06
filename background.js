browser.action.onClicked.addListener(async () => {
    browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
        let tab = tabs[0];

        browser.windows.create({
            type: "detached_panel",
            url: `popup/popup.html?tabId=${tab.id}`,
            width: 300,
            height: 400,
        });
    }, console.error);
});

// console.log("background.js loaded");
