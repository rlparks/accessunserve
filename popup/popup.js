const readFileButton = document.querySelector("#readFileButton");

readFileButton.addEventListener("click", async () => {
    const res = await readFile(readFileButton);
    console.log(res);

    const deptChanges = res["Department Changes"];
    console.log(filterByYYYYdashMMdashDD(deptChanges, "2024-05-30", "2024-06-31"));
});

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

            button.disabled = false;
            button.innerHTML = "Read File";
            resolve(dataJSON);
        });

        tempInput.click();
    });
}
