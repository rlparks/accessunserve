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
    ).innerHTML = `HR Status Changes: ${myIdsInLabs["HR Status Changes"].length}`;

    document.getElementById(
        "deptTitle"
    ).innerHTML = `Department Changes: ${myIdsInLabs["Department Changes"].length}`;

    document.getElementById(
        "posTitle"
    ).innerHTML = `Position Changes: ${myIdsInLabs["Position Changes"].length}`;

    document.getElementById("hrArea").innerHTML = myIdsInLabs["HR Status Changes"].join("\n");
    document.getElementById("deptArea").innerHTML = myIdsInLabs["Department Changes"].join("\n");
    document.getElementById("posArea").innerHTML = myIdsInLabs["Position Changes"].join("\n");
}

populateResults();
