console.log("Hello!");

document.querySelector("#readFileButton").addEventListener("click", async () => {
    const rows = await readFile();
    console.log(rows);
});

function readFile() {
    return new Promise((resolve, reject) => {
        const tempInput = document.createElement("input");
        tempInput.type = "file";
        tempInput.accept = ".xlsx";

        tempInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (!file) {
                reject("No file provided");
            }

            window.readXlsxFile(file).then((rows) => {
                resolve(rows);
            });
        });

        tempInput.click();
    });
}

const hrStatusChangesSchema = {
    Emplid: {
        prop: "id",
        type: String,
    },
    "Badge No": {
        prop: "badge",
        type: String,
    },
    "UGA MYID": {
        prop: "myid",
        type: String,
    },
    "Last Name": {
        prop: "lastName",
        type: String,
    },
    "First Name": {
        prop: "firstName",
        type: String,
    },
    "Middle Name": {
        prop: "middleName",
        type: String,
    },
    "Name Suffix": {
        prop: "suffix",
        type: String,
    },
    "Employee Record": {
        prop: "record",
        type: String,
    },
    "New Eff Date": {
        prop: "newEffDate",
        type: Date,
    },
    "New Job Action Date": {
        prop: "newJobActionDate",
        type: Date,
    },
    "New Job Action Code": {
        prop: "newJobActionCode",
        type: String,
    },
    "Job Indicator": {
        prop: "jobIndicator",
        type: String,
    },
    "Position No Descr": {
        prop: "positionNoDescr",
        type: String,
    },
    "Dept ID Descr": {
        prop: "deptIdDescr",
        type: String,
    },
};
