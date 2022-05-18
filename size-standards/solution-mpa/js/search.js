console.log('Search.js loaded');

let currentNAICS = [];

let apiURLs = {
    dev: 'https://sba-gov-yumi.s3.amazonaws.com/size-standards/data/naics.json',
    prod: 'https://www.sba.gov/naics.json'
}

// Populating search list with a NAICS code
let addSearch = function(naics) {
    // Show the search list
    let searchListTableElement = document.querySelector("#search-list");
    searchListTableElement.classList.remove('hidden');

    // Create new row in table
    let newSearchItemRow = searchListTableElement.insertRow();

    // Add a new cell for the NAICS code
    let newSearchItemCode = newSearchItemRow.insertCell();
    newSearchItemCode.textContent = naics;

    // Add a new cell for the NAICS description
    let newSearchItemDescription = newSearchItemRow.insertCell();
    newSearchItemDescription.textContent = extractNAICS(naics).description;

    // Clear out input box
    let inputElement = document.querySelector("#search-input");
    inputElement.value = '';

    // Add value to array to-be-searched
    currentNAICS.push(naics);
    console.log(currentNAICS);

    return currentNAICS;
}

let generateSearchUrl = function() {
    var url = new URL(window.location.href)
    var params = url.searchParams;

    console.log(encodeURI(currentNAICS));

    params.set('naics', encodeURI(currentNAICS));

    url.search = params.toString();
    var new_url = url.toString();

    console.log(new_url);

    return url.search;
}

// Generate list of autocomplete entries
let generateAutocompleteList = function() {
    let searchFormatted = NAICS.map((code) => {
        let codeItem = {
            label: `${code.id} - ${code.description}`,
            value: code.id
        }

        return codeItem;
    });

    console.log(searchFormatted);
    return searchFormatted;
}

// Get NAICS code (only 6 digits)
let extractNAICS = function(naics) {

    if (typeof(naics) === 'string') {
        if (naics.length > 6) {
            // Trim first 6 characters
            naics = naics.substring(0, 6);
        }
    } else {
        console.debug(`loader.search(${naics}) not a String`)
    }

    return NAICS.find(code => code.id === naics);

};

// Fetch data for NAICS
let fetchNAICS = function(url) {
    return fetch(url).then(function(response) {
        // The API call was successful, so check if response is valid (200)
        if (response.ok) {
            // Return the response by casting the object to JSON, sending to the .then block
            return response.json();
        } else {
            // Since the response was NOT ok, reject the promise, sending to the .catch block
            return Promise.reject(response);
        }
    }).then(function(data) {
        // data is JSON of the response
        console.debug(`fetchNAICS() succcess`);
        NAICS = data;

        autocompleteElement = document.querySelector("#search-input");

        new Awesomplete(autocompleteElement, {
            list: generateAutocompleteList()
        });

        autocompleteElement.addEventListener("awesomplete-selectcomplete", (event) => {
            console.log("NAICS added!", event.text);
            addSearch(event.text.value);
        });

        return data;
    }).catch(function(err) {
        // err is the raw response
        console.warn(`fetchNAICS() failed`, err.status, err.statusText, err.url);
        flash(`Unable to load NAICS codes, error ${err.status}: ${err.statusText}`);
        return err;
    })
};

let flash = function(msg) {
    let flashElement = document.querySelector('#flash');

    if (flashElement) {
        flashElement.textContent = msg;
        flashElement.classList.remove('hidden');
        return true;
    } else {
        return false;
    }
}

let navigate = function() {
    if (currentNAICS.length !== 0) {
        window.location.assign("./size.html" + generateSearchUrl());
    } else {
        flash('You need to specify at least one (1) NAICS code.')
    }
}

console.debug(`Hostname detected: ${window.location.hostname}`);
let url = window.location.hostname.includes('sba.gov') ? apiURLs.prod : apiURLs.dev;
console.debug(`Calling API at: ${url}`)
let NAICS = fetchNAICS(url);
console.debug(NAICS);