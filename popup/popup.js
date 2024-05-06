const readFileButton = document.querySelector("#readFileButton");

readFileButton.addEventListener("click", async () => {
    const res = await readFile(readFileButton);
    console.log(res);
});

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
