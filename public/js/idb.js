let db;
const request = indexedDB.open('budget_tracker', 1);

//handle the event of a change that needs to be made to the db's structure
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_budget', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadBudget();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    // open a transaction with the db w/ read & write premissions
    const transaction = db.transaction(['new_budget'], 'readwrite');
    //access the object tracker for 'new_budget'
    const budgetObjectStore = transaction.objectStore('new_budget');
    // add record to your tracker with add method
    budgetObjectStore.add(record);
}

function uploadBudget() {
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_budget');
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(['new_budget'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new_budget');
                //clear all items
                budgetObjectStore.clear();
                alert('All entries have been submitted');
            })
            .catch(err => {
                console.log(err);
                alert("error");
            });
        }
    };
}

window.addEventListener('online', uploadBudget);
