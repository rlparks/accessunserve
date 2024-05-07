// console.log("checkChematix.js loaded");

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
                            const userIdInput = document.querySelector("input[name='txtUserId']");

                            if (!userIdInput) {
                                alert(
                                    "Please open the View / Manage User Profile page to start the search"
                                );
                                return;
                            }

                            let currentSheetIndex = Object.keys(myIdsToCheck).indexOf(currentSheet);
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
                                await chrome.storage.local.set({ currentAction: "CLICK_PROFILE" });
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
