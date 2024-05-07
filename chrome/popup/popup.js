const readFileButton = document.querySelector("#readFileButton");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");

let myIds = {};

// window.chrome.storage.local.set({ runBackground: true, currentAction: "SEARCH" });
clearPreviousData();

readFileButton.addEventListener("click", async () => {
    myIds = await readFileAndGetMyIds();

    const params = new URLSearchParams(window.location.search);
    const tabId = Number(params.get("tabId"));
    await window.chrome.storage.local.set({
        myIdsToCheck: myIds,
        currentAction: "SEARCH",
        currentSheet: Object.keys(myIds)[0],
        runBackground: true,
    });
    window.chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: checkChematix,
    });

    const suggestion = document.getElementById("closeSuggestion");
    suggestion.innerHTML = "This window can now be closed";
});

async function clearPreviousData() {
    await chrome.storage.local.set({
        runBackground: false,
        myIdsToCheck: {},
        currentMyId: "",
        currentAction: "SEARCH",
        myIdsInLabs: { "HR Status Changes": [], "Department Changes": [], "Position Changes": [] },
        currentSheet: "",
    });
}

async function readFileAndGetMyIds() {
    const startFilterDate = startDateInput.value;
    const endFilterDate = endDateInput.value;
    if (!startFilterDate || !endFilterDate) {
        alert("Please provide start and end dates");
        return;
    }

    const res = await readFile(readFileButton);

    readFileButton.innerHTML = "Filtering employees...";
    const employeesToCheck = findInterestingEmployees(res, startFilterDate, endFilterDate);
    readFileButton.innerHTML = "Extracting MYIDs...";
    const employeeMyIds = extractMyIds(employeesToCheck);

    document.querySelectorAll(".added").forEach((element) => element.remove());

    const title = document.createElement("h2");
    title.innerHTML = "Employees in range:";
    title.className = "added";
    document.body.appendChild(title);
    for (const sheetName in employeeMyIds) {
        const myIds = employeeMyIds[sheetName];

        const sheetTitle = document.createElement("h3");
        sheetTitle.innerHTML = sheetName + ": " + myIds.length;
        sheetTitle.className = "added";
        const myIdArea = document.createElement("textarea");
        myIdArea.innerHTML = myIds.join("\n");
        myIdArea.className = "added";

        document.body.appendChild(sheetTitle);
        document.body.appendChild(myIdArea);
    }

    readFileButton.disabled = false;
    readFileButton.innerHTML = "Read File";

    return employeeMyIds;
}

function extractMyIds(megaEmployeesObj) {
    let obj = {};

    for (const sheetName in megaEmployeesObj) {
        const employees = megaEmployeesObj[sheetName];
        const employeeMyIds = employees.map((employee) => employee["UGA MYID"]);
        obj[sheetName] = employeeMyIds;
    }

    return obj;
}

function findInterestingEmployees(res, startFilterDate, endFilterDate) {
    let obj = {};

    for (const sheetName in res) {
        const employees = res[sheetName];
        const employeesFilteredByTime = filterByYYYYdashMMdashDD(
            employees,
            startFilterDate,
            endFilterDate
        );
        obj[sheetName] = employeesFilteredByTime;
    }

    return obj;
}

function isInterestingActionCode(actionCode) {
    return actionCode === "RET" || actionCode === "TER";
}

function filterByYYYYdashMMdashDD(arr, startDate, endDate) {
    let startDateObj = YYYYdashMMdashDDtoDate(startDate);
    let endDateObj = YYYYdashMMdashDDtoDate(endDate);
    startDateObj.setHours(0, 0, 0, 0);
    endDateObj.setHours(23, 59, 59, 999);

    return arr.filter((employee) => {
        const newEffDate = employee["New Eff Date"];
        return newEffDate >= startDateObj && newEffDate <= endDateObj;
    });
}

function YYYYdashMMdashDDtoDate(dateText) {
    const [year, month, day] = dateText.split("-");
    return new Date(year, month - 1, day);
}

function readFile(button) {
    return new Promise((resolve, reject) => {
        const tempInput = document.createElement("input");
        tempInput.type = "file";
        tempInput.accept = ".xlsx";

        tempInput.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (!file) {
                reject("No file provided");
            }

            button.disabled = true;
            button.innerHTML = "Reading file...";

            const data = await file.arrayBuffer();
            const workbook = window.XLSX.read(data, { cellDates: true });

            let dataJSON = {};
            for (const sheetName of workbook.SheetNames) {
                if (!sheetName.includes("map")) {
                    button.innerHTML = `Reading: ${sheetName}`;
                    const sheet = workbook.Sheets[sheetName];
                    dataJSON[sheetName] = window.XLSX.utils.sheet_to_json(sheet, { range: 8 });
                }
            }

            resolve(dataJSON);
        });

        tempInput.click();
    });
}

function checkChematix() {
    chrome.storage.local
        .get([
            "myIdsToCheck",
            "runBackground",
            "currentMyId",
            "currentAction",
            "myIdsInLabs",
            "currentSheet",
        ])
        .then(
            ({
                myIdsToCheck,
                runBackground,
                currentMyId,
                currentAction,
                myIdsInLabs,
                currentSheet,
            }) => {
                if (runBackground) {
                    async function check() {
                        // console.log("my ids to check: ", myIdsToCheck);
                        console.log(currentAction);
                        switch (currentAction) {
                            case "SEARCH":
                                const userIdInput =
                                    document.querySelector("input[name='txtUserId']");

                                if (!userIdInput) {
                                    alert(
                                        "Please open the View / Manage User Profile page to start the search"
                                    );
                                    return;
                                }

                                let currentSheetIndex =
                                    Object.keys(myIdsToCheck).indexOf(currentSheet);
                                const currentSheetIndexOriginal = currentSheetIndex;
                                while (
                                    currentSheetIndex < Object.keys(myIdsToCheck).length &&
                                    myIdsToCheck[currentSheet]?.length === 0
                                ) {
                                    currentSheet = Object.keys(myIdsToCheck)[currentSheetIndex + 1];
                                    currentSheetIndex++;
                                }

                                if (currentSheetIndexOriginal !== currentSheetIndex) {
                                    await chrome.storage.local.set({ currentSheet });
                                }

                                if (currentSheetIndex >= Object.keys(myIdsToCheck).length) {
                                    console.log("myids in labs: ", myIdsInLabs);
                                    // alert("All sheets have been checked");
                                    await chrome.storage.local.set({ runBackground: false });
                                    chrome.runtime.sendMessage("showResults");
                                    return;
                                }

                                if (myIdsToCheck[currentSheet]?.length > 0) {
                                    const current = myIdsToCheck[currentSheet].shift();
                                    await chrome.storage.local.set({
                                        myIdsToCheck,
                                        currentMyId: current,
                                    });

                                    // console.log("searching for: ", current);
                                    userIdInput.value = current;
                                    await chrome.storage.local.set({
                                        currentAction: "CLICK_PROFILE",
                                    });
                                    document.querySelector("input[name='cmdSearch']").click();
                                }
                                break;
                            case "CLICK_PROFILE":
                                // console.log("checking for: ", currentMyId);
                                const viewUserProfileButton = document.querySelector(
                                    'input[name="cmdViewProfile"]'
                                );

                                if (!viewUserProfileButton) {
                                    alert("User not found");
                                    await chrome.storage.local.set({ currentAction: "SEARCH" });
                                    return;
                                }

                                await chrome.storage.local.set({ currentAction: "CHECK_LABS" });
                                viewUserProfileButton.click();
                                break;
                            case "CHECK_LABS":
                                const successImg = document.querySelector(
                                    "img[src='/Chematix/images/error_correct.jpg']"
                                );

                                if (successImg) {
                                    // alert("User found");
                                    // this won't exist unless the account is in a lab(s)
                                    myIdsInLabs[currentSheet].push(currentMyId);
                                    await chrome.storage.local.set({
                                        myIdsInLabs,
                                    });
                                }

                                const finishedButton = document.querySelector(
                                    'input[name="cmdFinished"]'
                                );
                                await chrome.storage.local.set({
                                    currentAction: "SEARCH",
                                    currentMyId: "",
                                });
                                finishedButton.click();
                        }
                    }

                    check();
                }
            }
        );
}
