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

        // Gather list of HTML elements with corresponding data attribute
        let nodeList = document.querySelectorAll(`[data-${key}]`);

        if (nodeList.length > 0) {

            // If any elements exist that match the data key, then fill in data on each element (node)
            nodeList.forEach(function(node) {
                node.textContent = value;
                node.setAttribute(`data-${key}`, value);
            });

        } else {
            console.warn(`Unable to locate ${key}: ${value}`)
        }
    }

    return agencyCard;
}

function hydrateCharts(chartData) {

    console.log(chartData);

    // Prime Charts
    // https://stackoverflow.com/questions/28180871/grouped-bar-charts-in-chart-js

    // Compose data to be used in Prime Bar Chart for CFY Goals and Achievement
    const labelsBar = ["Small Business", "Women Owned", "Disadvantaged", "Service Disabled Veteran Owned", "HUBZone"];

    const primeBarChartGoals = [
        chartData.prime_sb_cfy_goal,
        chartData.prime_wosb_cfy_goal,
        chartData.prime_sdb_cfy_goal,
        chartData.prime_sdvosb_cfy_goal,
        chartData.prime_hz_cfy_goal
    ].map((goal) => parseInt(goal));

    const primeBarChartAchievements = [
        chartData.prime_sb_cfy_achievement,
        chartData.prime_wosb_cfy_achievement,
        chartData.prime_sdb_cfy_achievement,
        chartData.prime_sdvosb_cfy_achievement,
        chartData.prime_hz_cfy_achievement
    ].map((achievement) => parseInt(achievement));

    // Define chart from data with format and colors and labels 
    const primeDataBar = {
        labels: labelsBar,
        datasets: [{
            label: 'Goal',
            backgroundColor: 'rgba(147, 0, 0, 0.2)',
            borderColor: 'rgba(147, 0, 0, 1)',
            data: primeBarChartGoals,
            borderWidth: 1
        }, {
            label: 'Achievement',
            backgroundColor: 'rgba(0, 81, 139, 0.2)',
            borderColor: 'rgba(0, 81, 139, 1)',
            data: primeBarChartAchievements,
            borderWidth: 1
        }]
    };

    // Configure chart with options, e.g. positioning, title text, legend
    const primeConfigBar = {
        type: 'bar',
        data: primeDataBar,
        options: {
            plugins: {
                title: {
                    display: true,
                    fullSize: false,
                    position: 'top',
                    text: `${chartData.fiscal_year} Goals and Achievement`,
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

    // Instantiate the actual chart and hydrate it into the DOM
    const primeChartBar = new Chart(
        document.getElementById('primeBarChart'),
        primeConfigBar
    );

    // Compose data to be used in Prime Line Chart for Past 5 Years of Achievement
    const lineLabelsLine = [
        chartData.fiscal_year - 4,
        chartData.fiscal_year - 3,
        chartData.fiscal_year - 2,
        chartData.fiscal_year - 1,
        chartData.fiscal_year
    ];

    // Small Business
    const primeLineChartAchievementsSB = [
        chartData.prime_sb_pfy4_achievement,
        chartData.prime_sb_pfy3_achievement,
        chartData.prime_sb_pfy2_achievement,
        chartData.prime_sb_pfy_achievement,
        chartData.prime_sb_cfy_achievement
    ].map((achievement) => parseInt(achievement));

    // Women Owned Small Business
    const primeLineChartAchievementsWOSB = [
        chartData.prime_wosb_pfy4_achievement,
        chartData.prime_wosb_pfy3_achievement,
        chartData.prime_wosb_pfy2_achievement,
        chartData.prime_wosb_pfy_achievement,
        chartData.prime_wosb_cfy_achievement
    ].map((achievement) => parseInt(achievement));

    // Disadvantaged
    const primeLineChartAchievementsSDB = [
        chartData.prime_sdb_pfy4_achievement,
        chartData.prime_sdb_pfy3_achievement,
        chartData.prime_sdb_pfy2_achievement,
        chartData.prime_sdb_pfy_achievement,
        chartData.prime_sdb_cfy_achievement
    ].map((achievement) => parseInt(achievement));

    // Service Disabled Veteran Owned
    const primeLineChartAchievementsSDVOSB = [
        chartData.prime_sdvosb_pfy4_achievement,
        chartData.prime_sdvosb_pfy3_achievement,
        chartData.prime_sdvosb_pfy2_achievement,
        chartData.prime_sdvosb_pfy_achievement,
        chartData.prime_sdvosb_cfy_achievement
    ].map((achievement) => parseInt(achievement));

    // HUBZone
    const primeLineChartAchievementsHZ = [
        chartData.prime_hz_pfy4_achievement,
        chartData.prime_hz_pfy3_achievement,
        chartData.prime_hz_pfy2_achievement,
        chartData.prime_hz_pfy_achievement,
        chartData.prime_hz_cfy_achievement
    ].map((achievement) => parseInt(achievement));

    // Define chart from data with format and colors and labels 
    const primeDataLine = {
        labels: lineLabelsLine,
        datasets: [{
            label: 'Small Business',
            data: primeLineChartAchievementsSB,
            fill: false,
            borderColor: 'rgb(147, 0, 0)',
            tension: 0.1
        }, {
            label: 'Women Owned',
            data: primeLineChartAchievementsWOSB,
            fill: false,
            borderColor: 'rgba(0, 81, 139, 1)',
            tension: 0.1
        }, {
            label: 'Disadvantaged',
            data: primeLineChartAchievementsSDB,
            fill: false,
            borderColor: 'rgba(88, 172, 239, 1)',
            tension: 0.1
        }, {
            label: 'Service Disabled Veteran Owned',
            data: primeLineChartAchievementsSDVOSB,
            fill: false,
            borderColor: 'rgba(25, 126, 78, 1)',
            tension: 0.1
        }, {
            label: 'HUBZone',
            data: primeLineChartAchievementsHZ,
            fill: false,
            borderColor: 'rgba(241, 196, 0, 1)',
            tension: 0.1
        }]
    };

    // Configure chart with options, e.g. positioning, title text, legend
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

    // Instantiate the actual chart and hydrate it into the DOM
    const primeChartLine = new Chart(
        document.getElementById('primeLineChart'),
        primeConfigLine
    );

    // Subcontracting Charts

    // Compose data to be used in Subcontracting Bar Chart for CFY Goals and Achievement
    const subBarChartGoals = [
        chartData.sub_sb_cfy_goal,
        chartData.sub_wosb_cfy_goal,
        chartData.sub_sdb_cfy_goal,
        chartData.sub_sdvosb_cfy_goal,
        chartData.sub_hz_cfy_goal
    ].map((goal) => parseInt(goal));

    const subBarChartAchievements = [
        chartData.sub_sb_cfy_achievement,
        chartData.sub_wosb_cfy_achievement,
        chartData.sub_sdb_cfy_achievement,
        chartData.sub_sdvosb_cfy_achievement,
        chartData.sub_hz_cfy_achievement
    ].map((achievement) => parseInt(achievement));

    const subDataBar = {
        labels: labelsBar,
        datasets: [{
            label: 'Goal',
            backgroundColor: 'rgba(147, 0, 0, 0.2)',
            borderColor: 'rgba(147, 0, 0, 1)',
            data: subBarChartGoals,
            borderWidth: 1
        }, {
            label: 'Achievement',
            backgroundColor: 'rgba(0, 81, 139, 0.2)',
            borderColor: 'rgba(0, 81, 139, 1)',
            data: subBarChartAchievements,
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
                    text: `${chartData.fiscal_year} Goals and Achievement`,
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

    // Instantiate the actual chart and hydrate it into the DOM
    const subChartBar = new Chart(
        document.getElementById('subBarChart'),
        subConfigBar
    );

    // Compose data to be used in Sub Line Chart for Past 5 Years of Achievement
    // Small Business
    const subLineChartAchievementsSB = [
        chartData.sub_sb_pfy4_achievement,
        chartData.sub_sb_pfy3_achievement,
        chartData.sub_sb_pfy2_achievement,
        chartData.sub_sb_pfy_achievement,
        chartData.sub_sb_cfy_achievement
    ].map((achievement) => parseInt(achievement));

    // Women Owned Small Business
    const subLineChartAchievementsWOSB = [
        chartData.sub_wosb_pfy4_achievement,
        chartData.sub_wosb_pfy3_achievement,
        chartData.sub_wosb_pfy2_achievement,
        chartData.sub_wosb_pfy_achievement,
        chartData.sub_wosb_cfy_achievement
    ].map((achievement) => parseInt(achievement));

    // Disadvantaged
    const subLineChartAchievementsSDB = [
        chartData.sub_sdb_pfy4_achievement,
        chartData.sub_sdb_pfy3_achievement,
        chartData.sub_sdb_pfy2_achievement,
        chartData.sub_sdb_pfy_achievement,
        chartData.sub_sdb_cfy_achievement
    ].map((achievement) => parseInt(achievement));

    // Service Disabled Veteran Owned
    const subLineChartAchievementsSDVOSB = [
        chartData.sub_sdvosb_pfy4_achievement,
        chartData.sub_sdvosb_pfy3_achievement,
        chartData.sub_sdvosb_pfy2_achievement,
        chartData.sub_sdvosb_pfy_achievement,
        chartData.sub_sdvosb_cfy_achievement
    ].map((achievement) => parseInt(achievement));

    // HUBZone
    const subLineChartAchievementsHZ = [
        chartData.sub_hz_pfy4_achievement,
        chartData.sub_hz_pfy3_achievement,
        chartData.sub_hz_pfy2_achievement,
        chartData.sub_hz_pfy_achievement,
        chartData.sub_hz_cfy_achievement
    ].map((achievement) => parseInt(achievement));

    const subDataLine = {
        labels: lineLabelsLine,
        datasets: [{
            label: 'Small Business',
            data: subLineChartAchievementsSB,
            fill: false,
            borderColor: 'rgb(147, 0, 0)',
            tension: 0.1
        }, {
            label: 'Women Owned',
            data: subLineChartAchievementsWOSB,
            fill: false,
            borderColor: 'rgba(0, 81, 139, 1)',
            tension: 0.1
        }, {
            label: 'Disadvantaged',
            data: subLineChartAchievementsSDB,
            fill: false,
            borderColor: 'rgba(88, 172, 239, 1)',
            tension: 0.1
        }, {
            label: 'Service Disabled Veteran Owned',
            data: subLineChartAchievementsSDVOSB,
            fill: false,
            borderColor: 'rgba(25, 126, 78, 1)',
            tension: 0.1
        }, {
            label: 'HUBZone',
            data: subLineChartAchievementsHZ,
            fill: false,
            borderColor: 'rgba(241, 196, 0, 1)',
            tension: 0.1
        }]
    };

    // Configure chart with options, e.g. positioning, title text, legend
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

    // Instantiate the actual chart and hydrate it into the DOM
    const subChartLine = new Chart(
        document.getElementById('subLineChart'),
        subConfigLine
    );

    // Comparison Bar Chart

    // Compose data to be used in Small Business Comparison chart
    // Previous Fiscal Year Count

    const comparisonPFYCount = [
        chartData.category_sb_pfy_vendor_count,
        chartData.category_wosb_pfy_vendor_count,
        chartData.category_sdb_pfy_vendor_count,
        chartData.category_sdvosb_pfy_vendor_count,
        chartData.category_hz_pfy_vendor_count
    ].map((comparison) => parseInt(comparison.replace(/,/g, '')));

    console.log(comparisonPFYCount)

    // Current Fiscal Year Count
    const comparisonCFYCount = [
        chartData.category_sb_cfy_vendor_count,
        chartData.category_wosb_cfy_vendor_count,
        chartData.category_sdb_cfy_vendor_count,
        chartData.category_sdvosb_cfy_vendor_count,
        chartData.category_hz_cfy_vendor_count
    ].map((comparison) => parseInt(comparison.replace(/,/g, '')));

    console.log(comparisonCFYCount)

    const comparisonDataBar = {
        labels: labelsBar,
        datasets: [{
            label: `${chartData.fiscal_year_previous} Count`,
            backgroundColor: 'rgba(147, 0, 0, 0.2)',
            borderColor: 'rgba(147, 0, 0, 1)',
            data: comparisonPFYCount,
            borderWidth: 1
        }, {
            label: `${chartData.fiscal_year} Count`,
            backgroundColor: 'rgba(0, 81, 139, 0.2)',
            borderColor: 'rgba(0, 81, 139, 1)',
            data: comparisonCFYCount,
            borderWidth: 1
        }]
    };

    // Configure chart with options, e.g. positioning, title text, legend
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

    // Instantiate the actual chart and hydrate it into the DOM
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