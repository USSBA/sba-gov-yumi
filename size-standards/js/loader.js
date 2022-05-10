let loader = (function() {

    // Variables

    let NAICS;
    let naicsURL = 'https://www.sba.gov/naics'

    let public = {};

    // Methods

    let fetchNAICS = function() {
        return fetch(naicsURL).then(function(response) {
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
            NAICS = data;
            return data;
        }).catch(function(err) {
            // err is the raw response
            console.warn(`fetchNAICS() failed`, err.status, err.statusText, err.url);

            return err;
        })
    };

    public.naics = function() {
        return NAICS.map((code) => code.id + " " + code.description);
    }

    public.search = function(naics) {

        if (typeof(naics) === String) {
            if (naics.length > 6) {
                // Trim first 6 characters
                naics = naics.substring(0, 6);
            }
        } else {
            console.debug(`loader.search(${naics}) not a String`)
        }

        return NAICS.find(code => code.id === naics);
    };

    public.init = function(options) {
        NAICS = fetchNAICS();
        console.log(`Loader initialized and retrieved: ${NAICS.length}`);
    };

    // Return the Public APIs

    return public;

})();