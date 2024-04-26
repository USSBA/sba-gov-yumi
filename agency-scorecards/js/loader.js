let loader = (function() {

    // Variables
    let agencyData = {};
    let scorecardData = [];
    const dataURL = window.location.href.indexOf("sba.gov") > -1
        ? 'https://api.sba.gov/agency-scorecards'
        : `${window.location.href.slice(0, window.location.href.lastIndexOf('/'))}/data`

    // Public API
    let public = {};

    // Private Methods

    /*!
     * Get the URL parameters
     * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com
     * @param  {String} url The URL
     * @return {Object}     The URL parameters
     */
    let getParams = function(url = window.location) {
        let params = {};
        new URL(url).searchParams.forEach(function(val, key) {
            if (params[key] !== undefined) {
                if (!Array.isArray(params[key])) {
                    params[key] = [params[key]];
                }
                params[key].push(val);
            } else {
                params[key] = val;
            }
        });
        return params;
    }

    /*!
     * Add URL changes to browser's history
     * @param  {String} agency The agency being searched for
     * @param  {String} year   The year of that agency's scorecard
     * @return {String}        The URL that was added
     */
    let updateURL = function(agency = 'GW', year) {
        let state = history.state;
        let title = `${agency} Scorecard in ${year}`;
        let url = window.location.origin + window.location.pathname + '?agency=' + encodeURI(agency) + '&year=' + encodeURI(year);

        history.pushState(state, title, url);
        return url;
    }

    /*!
     * Retrieve agency scorecard data for a given year
     * @param  {String} year   The year of that agency's scorecard
     * @return {Object}        JSON representation of that year's data
     */
    public.fetchScorecardData = function(year) {
        // Compose the URL for the JSON file
        var queryURL = dataURL + '/' + year + '.json';
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
            console.info(`fetchScorecardData(year = ${year}) succcess`);
            return data;
        }).catch(function(err) {
            // err is the raw response
            console.warn(`fetchScorecardData(year = ${year}) failed`, err.status, err.statusText, err.url);
            return err;
        })
    }

    // Public Methods

    /*!
     * Filter a given agency's data out of the entire data set
     * @param  {String} name   The agency being searched for
     * @return {Object}        JSON representation of that agency
     */
    public.getAgencyData = function(name = 'GW') {
        return scorecardData.find(agency => agency.department_acronym === name)
    }

    /*!
     * Initialize the module, which loads a given year's scorecard data
     * @return {Object}        JSON representation of that agency
     */
    public.init = async function() {
        let currentParams = getParams();
        let { agency = 'GW', year = 2023 } = currentParams;
        console.debug(`loader.js initialized with agency: ${agency}, year: ${year}`);

        scorecardData = await public.fetchScorecardData(year);

        agencyData = public.getAgencyData(agency);

        return agencyData;
    };

    // Return the Public APIs
    return public;

})();