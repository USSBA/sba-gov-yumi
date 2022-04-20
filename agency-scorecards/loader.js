// Retrieve data from S3
function fetchScorecardData(year) {
    // Compose the URL for the JSON file
    var queryURL = `https://ryan-poc-shared-header-footer.s3.amazonaws.com/agency-scorecards/data/${year}.json`
    return fetch(queryURL).then(function(response) {
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
        return data;
    }).catch(function(err) {
        // err is the raw response
        return data.json();
    })
}

// Camel case helper: https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
function camalize(str) {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

// Hydration helper
function hydrateElement(ele, data) {
    ele.dataset.data = data;
    ele.textContent = data
}

// Hydrate HTML with data
async function hydrateHTML(name, year) {
    // Retrieve all the scorecard data for that year
    let scorecardData = await fetchScorecardData(year);
    // Find the individual agency
    let agencyCard = scorecardData.find(agency => agency.department_acronym === name)
    console.log(agencyCard);

    for (const [key, value] of Object.entries(agencyCard)) {
        let ele = document.querySelector(`[data-${key}]`);
        if (ele) {
            ele.textContent = value;
            console.log(`Hydrated ${key}: ${value}`);
        }
    }

    return agencyCard;
}

let agencyData = hydrateHTML("DOC", 2021);