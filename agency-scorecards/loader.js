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

// Hydrate HTML with data
async function hydrateHTML(name, year) {
    // Retrieve all the scorecard data for that year
    let scorecardData = await fetchScorecardData(year);
    // Find the individual agency
    let agencyCard = scorecardData.find(agency => agency.department_acronym === name)
    console.log(agencyCard);

    // Hydrate values on each HTML element from data
    for (const [key, value] of Object.entries(agencyCard)) {
        let nodeList = document.querySelectorAll(`[data-${key}]`);
        if (nodeList.length > 0) {
            nodeList.forEach(function(node) {
                // console.log(`Hydrating ${node}`)
                node.textContent = value;
                // console.info(`Hydrated ${key}: ${value}`);
            });
        } else {
            console.warn(`Unable to locate ${key}: ${value}`)
        }
    }

    // Compute values not found in the data
    let previousFiscalYear = agencyCard.fiscal_year - 1;

    // Hydrate values that are computed from data
    let nodeListComputed = document.querySelectorAll(`[data-fiscal_year-previous]`)
    console.log(nodeListComputed);
    nodeListComputed.forEach(function(node) {
        // console.log(`Hydrating ${node}`)
        node.textContent = previousFiscalYear;
        // console.info(`Hydrated fiscal_year-previous: ${previousFiscalYear}`);
    })

    return agencyCard;
}

function hydrateCharts(chartData) {
    // WIP -- need to think about how to do this efficiently
    // Destructure from raw data
    const primeSBAchievement = [chartData.prime_sb_percentage];
    // Compose into new usable data array
    console.log(chartData);
    console.log(parseInt(chartData.prime_sb_percentage_cfy_goal));

    const labelsBar = ["Small Business", "Women Owned", "Disadvantaged", "Veteran Owned", "HUBZone"];

    // Prime Charts
    // https://stackoverflow.com/questions/28180871/grouped-bar-charts-in-chart-js
    const primeDataBar = {
        labels: labelsBar,
        datasets: [{
            label: 'Goal',
            backgroundColor: 'rgba(147, 0, 0, 0.2)',
            borderColor: 'rgba(147, 0, 0, 1)',
            data: [parseInt(chartData.prime_sb_percentage_cfy_goal), 4, 10, 2, 2],
            borderWidth: 1
        }, {
            label: 'Achievement',
            backgroundColor: 'rgba(0, 81, 139, 0.2)',
            borderColor: 'rgba(0, 81, 139, 1)',
            data: [25, 3, 11, 4, 1],
            borderWidth: 1
        }]
    };
    const primeConfigBar = {
        type: 'bar',
        data: primeDataBar,
        options: {
            plugins: {
                title: {
                    display: true,
                    fullSize: false,
                    position: 'top',
                    text: '2020 Goals and Achievement',
                },
                legend: {
                    display: true,
                    position: 'right'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        },
    };

    const primeChartBar = new Chart(
        document.getElementById('primeBarChart'),
        primeConfigBar
    );

    const primeLabelsLine = ["2017", "2018", "2019", "2020"];
    const primeDataLine = {
        labels: primeLabelsLine,
        datasets: [{
            label: 'Small Business',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            borderColor: 'rgb(147, 0, 0)',
            tension: 0.1
        }, {
            label: 'Women Owned',
            data: [25, 32, 41, 22, 11, 5, 16],
            fill: false,
            borderColor: 'rgba(0, 81, 139, 1)',
            tension: 0.1
        }, {
            label: 'Disadvantaged',
            data: [17, 15, 16, 21, 19, 24, 21],
            fill: false,
            borderColor: 'rgba(88, 172, 239, 1)',
            tension: 0.1
        }, {
            label: 'Veteran Owned',
            data: [6, 7, 2, 5, 10, 4, 3],
            fill: false,
            borderColor: 'rgba(25, 126, 78, 1)',
            tension: 0.1
        }, {
            label: 'HUBZone',
            data: [1, 3, 5, 4, 2, 4, 7],
            fill: false,
            borderColor: 'rgba(241, 196, 0, 1)',
            tension: 0.1
        }]
    };

    const primeConfigLine = {
        type: 'line',
        data: primeDataLine,
        options: {
            plugins: {
                title: {
                    display: true,
                    fullSize: false,
                    position: 'top',
                    text: 'Prime Contracting Achievement',
                },
                legend: {
                    display: true,
                    position: 'right'
                }
            },
        }
    };

    const primeChartLine = new Chart(
        document.getElementById('primeLineChart'),
        primeConfigLine
    );

    // Subcontracting Charts

    const subDataBar = {
        labels: labelsBar,
        datasets: [{
            label: 'Goal',
            backgroundColor: 'rgba(147, 0, 0, 0.2)',
            borderColor: 'rgba(147, 0, 0, 1)',
            data: [22, 4, 10, 2, 2],
            borderWidth: 1
        }, {
            label: 'Achievement',
            backgroundColor: 'rgba(0, 81, 139, 0.2)',
            borderColor: 'rgba(0, 81, 139, 1)',
            data: [25, 3, 11, 4, 1],
            borderWidth: 1
        }]
    }
    const subConfigBar = {
        type: 'bar',
        data: subDataBar,
        options: {
            plugins: {
                title: {
                    display: true,
                    fullSize: false,
                    position: 'top',
                    text: '2020 Goals and Achievement',
                },
                legend: {
                    display: true,
                    position: 'right'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        },
    };

    const subChartBar = new Chart(
        document.getElementById('subBarChart'),
        subConfigBar
    );

    const subLabelsLine = ["2017", "2018", "2019", "2020"];
    const subDataLine = {
        labels: subLabelsLine,
        datasets: [{
            label: 'Small Business',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            borderColor: 'rgb(147, 0, 0)',
            tension: 0.1
        }, {
            label: 'Women Owned',
            data: [25, 32, 41, 22, 11, 5, 16],
            fill: false,
            borderColor: 'rgba(0, 81, 139, 1)',
            tension: 0.1
        }, {
            label: 'Disadvantaged',
            data: [17, 15, 16, 21, 19, 24, 21],
            fill: false,
            borderColor: 'rgba(88, 172, 239, 1)',
            tension: 0.1
        }, {
            label: 'Veteran Owned',
            data: [6, 7, 2, 5, 10, 4, 3],
            fill: false,
            borderColor: 'rgba(25, 126, 78, 1)',
            tension: 0.1
        }, {
            label: 'HUBZone',
            data: [1, 3, 5, 4, 2, 4, 7],
            fill: false,
            borderColor: 'rgba(241, 196, 0, 1)',
            tension: 0.1
        }]
    };

    const subConfigLine = {
        type: 'line',
        data: subDataLine,
        options: {
            plugins: {
                title: {
                    display: true,
                    fullSize: false,
                    position: 'top',
                    text: 'Subcontracting Achievement',
                },
                legend: {
                    display: true,
                    position: 'right'
                }
            },
        }
    };

    const subChartLine = new Chart(
        document.getElementById('subLineChart'),
        subConfigLine
    );

    // Comparison Bar Chart

    const comparisonDataBar = {
        labels: labelsBar,
        datasets: [{
            label: 'FY19 Count',
            backgroundColor: 'rgba(147, 0, 0, 0.2)',
            borderColor: 'rgba(147, 0, 0, 1)',
            data: [22, 4, 10, 2, 2],
            borderWidth: 1
        }, {
            label: 'FY20 Count',
            backgroundColor: 'rgba(0, 81, 139, 0.2)',
            borderColor: 'rgba(0, 81, 139, 1)',
            data: [25, 3, 11, 4, 1],
            borderWidth: 1
        }]
    };
    const comparisonConfigBar = {
        type: 'bar',
        data: comparisonDataBar,
        options: {
            plugins: {
                title: {
                    display: true,
                    fullSize: false,
                    position: 'top',
                    text: 'Number of Small Business Comparison',
                },
                legend: {
                    display: true,
                    position: 'right'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        },

    };

    const comparisonChartBar = new Chart(
        document.getElementById('comparisonBarChart'),
        comparisonConfigBar
    );

    return chartData;
}

/*!
 * Get the URL parameters
 * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {String} url The URL
 * @return {Object}     The URL parameters
 */
function getParams(url = window.location) {
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

/**
 * Update the URL with a query string for the search string
 * @param  {String} agency The agency being searched for
 * @param  {String} year   The year of that agency's scorecard
 */
function updateURL(agency, year) {

    // Create the properties
    let state = history.state;
    let title = document.title;
    let url = window.location.origin + window.location.pathname + '?agency=' + encodeURI(agency) + '&year=' + encodeURI(year);

    history.pushState(state, title, url);

    let agencyData = new Promise(function(resolve, reject) {
        resolve(hydrateHTML(agency, year));
    }).then(function(result) {
        console.log('result block')
        return hydrateCharts(result);
    })

}

function onload() {
    let currentParams = getParams();
    let { agency, year } = currentParams;
    updateURL(agency, year);
}

onload();

// https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes