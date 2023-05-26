(function() {

  const fetchScorecardData = function(year) {
    // Compose the URL for the JSON file
    const queryURL = '/agency-scorecards/data';

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

const hydrateDataElements = data => {
  const dataMissing = [];
  const mainElement = document.querySelector('table');

  for (const element of data) {
    const agencyAcronym = element.department_acronym;
    const firstUrlElement = mainElement.querySelector(`[data-${agencyAcronym}-url_1]`);
    const secondUrlElement = mainElement.querySelector(`[data-${agencyAcronym}-url_2]`);
    const gradeElement = mainElement.querySelector(`[data-${agencyAcronym}-agency_grade]`);
    const scoreElement = mainElement.querySelector(`[data-${agencyAcronym}-agency_score]`);

    firstUrlElement.href = `scorecard.html?agency=${agencyAcronym}&year=2022`;
    secondUrlElement.href = `scorecard.html?agency=${agencyAcronym}&year=2022`;
    gradeElement.textContent = element.agency_grade;
    scoreElement.textContent = element.agency_score;
  }

  console.debug(`Unable to locate HTML elements with data- attributes: ${dataMissing}`);

  return dataMissing;
}

fetchScorecardData(2022).then((data)=> {
  hydrateDataElements(data)
})

})();