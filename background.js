browser.action.onClicked.addListener(() => {
    // window.alert("e");
    // console.log("clciked");
    browser.windows.create({
        type: "detached_panel",
        url: "popup/popup.html",
        width: 300,
        height: 400,
    });
});

// console.log("background.js loaded");
