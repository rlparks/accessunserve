browser.action.onClicked.addListener(() => {
    // window.alert("e");
    // console.log("clciked");
    browser.windows.create({
        type: "normal",
        url: "popup/popup.html",
        width: 200,
        height: 400,
    });
});

// console.log("background.js loaded");
