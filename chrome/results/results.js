async function populateResults() {
    const { myIdsInLabs } = await chrome.storage.local.get("myIdsInLabs");

    await chrome.storage.local.set({
        runBackground: false,
        myIdsToCheck: {},
        currentMyId: "",
        currentAction: "SEARCH",
        myIdsInLabs: { "HR Status Changes": [], "Department Changes": [], "Position Changes": [] },
        currentSheet: "",
    });

    // console.log(myIdsInLabs);

    document.getElementById(
        "hrTitle"
    ).textContent = `HR Status Changes: ${myIdsInLabs["HR Status Changes"].length}`;

    document.getElementById(
        "deptTitle"
    ).textContent = `Department Changes: ${myIdsInLabs["Department Changes"].length}`;

    document.getElementById(
        "posTitle"
    ).textContent = `Position Changes: ${myIdsInLabs["Position Changes"].length}`;

    document.getElementById("hrArea").textContent = myIdsInLabs["HR Status Changes"].join("\n");
    document.getElementById("deptArea").textContent = myIdsInLabs["Department Changes"].join("\n");
    document.getElementById("posArea").textContent = myIdsInLabs["Position Changes"].join("\n");
}

populateResults();
