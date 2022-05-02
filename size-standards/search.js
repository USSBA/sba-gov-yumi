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

function submitSearch() {
    console.log(NAICS);
    console.log(typeof(NAICS));
    let query = autocompleteElement.value;
    console.log(query);
    let queryFormatted = query.substring(0, 6);
    console.log(queryFormatted);
    let result = NAICS.find(code => code.id === queryFormatted);
    console.log(result);

    if (result.employeeCountLimit) {
        console.log("Employee limit:", result.employeeCountLimit);
    }

    if (result.revenueLimit) {
        console.log("Revenue limit:", result.revenueLimit);
    }

    // const expr = 'Papayas';
    // switch (expr) {
    //     case 'Oranges':
    //         console.log('Oranges are $0.59 a pound.');
    //         break;
    //     case 'Mangoes':
    //     case 'Papayas':
    //         console.log('Mangoes and papayas are $2.79 a pound.');
    //         // expected output: "Mangoes and papayas are $2.79 a pound."
    //         break;
    //     default:
    //         console.log(`Sorry, we are out of ${expr}.`);
    // }
}

// URL of NAICS API
const queryURL = 'https://www.sba.gov/naics'

// All NAICS data
fetchNAICS(queryURL).then(response => NAICS = response);