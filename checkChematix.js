browser.storage.local
    .get(["myIdsToCheck", "runBackground", "currentMyId", "currentAction", "myIdsInLabs"])
    .then(({ myIdsToCheck, runBackground, currentMyId, currentAction, myIdsInLabs }) => {
        if (runBackground) {
            async function check() {
                console.log("my ids to check: ", myIdsToCheck);

                switch (currentAction) {
                    case "SEARCH":
                        console.log("searching for: ", currentMyId);
                        break;
                }
            }

            check();
        }
    });
