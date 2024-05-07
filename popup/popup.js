const readFileButton = document.querySelector("#readFileButton");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");

let myIds = {};

// window.browser.storage.local.set({ runBackground: true, currentAction: "SEARCH" });
clearPreviousData();

readFileButton.addEventListener("click", async () => {
    myIds = await readFileAndGetMyIds();

    const params = new URLSearchParams(window.location.search);
    const tabId = Number(params.get("tabId"));
    await window.browser.storage.local.set({
        myIdsToCheck: myIds,
        currentAction: "SEARCH",
        currentSheet: Object.keys(myIds)[0],
        runBackground: true,
    });
    window.browser.scripting.executeScript({
        target: { tabId: tabId },
        files: ["../checkChematix.js"],
    });
});

async function clearPreviousData() {
    await browser.storage.local.set({
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
        myIdArea.style.height = "150px";

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
