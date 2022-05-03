var NAICS;

// Get value of Awesomplete input
const autocompleteElement = document.querySelector("#search-input")

function fetchNAICS(url) {
    return fetch(url).then(function(response) {
        // The API call was successful, so check if response is valid (200)
        if (response.ok) {
            // Return the response by casting the object to JSON, sending to the .then block
            return response.json();
        } else {
            // Since the response was NOT ok, reject the promise, sending to the .catch block
            return Promise.reject(response)
        }
    }).then(function(data) {
        // data is JSON of the response
        console.info(`fetchNAICS() succcess`);

        // Filter out NAICS numbers and descriptions for search
        let codes = data.map((code) => code.id + " " + code.description);

        // Load all NAICS into auto-complete input
        new Awesomplete(autocompleteElement, {
            list: codes
        });

        return data;
    }).catch(function(err) {
        // err is the raw response
        console.warn(`fetchNAICS() failed`, err.status, err.statusText, err.url);

        return err;
    })
}

function deleteNullValues(obj) {
    for (const key in obj) {
        if (obj[key] === null) {
            delete obj[key];
        }
    }

    return obj;
}

function submitSearch() {
    let query = autocompleteElement.value;
    let queryFormatted = query.substring(0, 6);
    let result = NAICS.find(code => code.id === queryFormatted);
    let nextURLParams = new URLSearchParams(deleteNullValues(result)).toString();

    console.log(nextURLParams);

    window.location.href = `size.html?${nextURLParams}`;
    // if (queryFormatted === '324110') {
    //     console.log("Special limit:", result);
    //     window.location.href = `size.html?NAICS=${queryFormatted}&limit=special`
    // }

    // if (result.employeeCountLimit) {
    //     console.log("Employee limit:", result.employeeCountLimit);
    //     window.location.href = `size.html?NAICS=${queryFormatted}&limit=employee`
    // }

    // if (result.revenueLimit) {
    //     console.log("Revenue limit:", result.revenueLimit);
    //     window.location.href = `size.html?NAICS=${queryFormatted}&limit=revenue`
    // }
}

// URL of NAICS API
const queryURL = 'https://www.sba.gov/naics'

// All NAICS data
fetchNAICS(queryURL).then(response => NAICS = response);