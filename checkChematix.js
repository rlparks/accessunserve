browser.storage.local
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
                    console.log("my ids to check: ", myIdsToCheck);
                    console.log(currentAction);
                    switch (currentAction) {
                        case "SEARCH":
                            const userIdInput = document.querySelector("input[name='txtUserId']");

                            if (!userIdInput) {
                                alert(
                                    "Please open the View / Manage User Profile page to start the search"
                                );
                                return;
                            }

                            const currentSheetIndex =
                                Object.keys(myIdsToCheck).indexOf(currentSheet);

                            if (myIdsToCheck[currentSheet]?.length === 0) {
                                if (currentSheetIndex < Object.keys(myIdsToCheck).length - 1) {
                                    currentSheet = Object.keys(myIdsToCheck)[currentSheetIndex + 1];
                                    await browser.storage.local.set({
                                        currentSheet,
                                    });
                                } else {
                                    alert("All sheets have been checked");
                                    // await browser.storage.local.set({ runBackground: false });
                                    return;
                                }
                            }

                            if (myIdsToCheck[currentSheet]?.length > 0) {
                                const current = myIdsToCheck[currentSheet].shift();
                                await browser.storage.local.set({
                                    myIdsToCheck,
                                    currentMyId: current,
                                });

                                console.log("searching for: ", current);
                                userIdInput.value = current;
                                await browser.storage.local.set({ currentAction: "CHECK" });
                                document.querySelector("input[name='cmdSearch']").click();
                            }
                            break;
                        case "CHECK":
                            console.log("checking for: ", currentMyId);
                            break;
                    }
                }

                check();
            }
        }
    );
