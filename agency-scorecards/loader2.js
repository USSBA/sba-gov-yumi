// Apply appropriate CSS color to score box 
// Replace this function with native CSS using the :has() pseudo-class when it is fully supported: https://caniuse.com/css-has 
function styleLetterGrade(grade) {
    const letterGradeBlock = document.querySelector('.grade');

    let gradeFormatted = grade.replace(/[\W_]+/g, '');
    let gradeColor = '#E2EFD9';

    switch (gradeFormatted) {
        case 'A':
            gradeColor = '#C4E9B3';
            break;
        case 'B':
            gradeColor = '#CCEAFF';
            break;
        case 'C':
            gradeColor = '#FFFFB3';
            break;
        case 'D':
            gradeColor = '#FEE3C2';
            break;
        case 'F':
            gradeColor = '#F1A9A9';
            break;
        default:
            console.warn(`styleLetterGrade(grade = ${grade})`, `Unable to recognize letter when gradeFormatted = ${gradeFormatted}.`);
    }

    letterGradeBlock.setAttribute("style", `background-color: ${gradeColor};`);
}

// Hydrate HTML with data
async function hydrateHTML(name, year) {

    // Retrieve all the scorecard data for that year
    let scorecardData = await fetchScorecardData(year);

    // Find the individual agency
    let agencyCard = scorecardData.find(agency => agency.department_acronym === name)
    let dataMissing = [];

    // Hydrate values on each HTML element from data
    for (const [key, value] of Object.entries(agencyCard)) {

        // Gather list of HTML elements with corresponding data attribute
        // https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes
        let nodeList = document.querySelectorAll(`[data-${key}]`);

        if (nodeList.length > 0) {

            // If any elements exist that match the data key, then fill in data on each element (node)
            nodeList.forEach(function(node) {
                node.textContent = value;
                node.setAttribute(`data-${key}`, value);
            });

        } else {
            dataMissing.push(`${key}: ${value}`)
        }

    }

    console.debug(`hydrateHTML(name = ${name}, year= ${year})`, "Unable to locate HTML elements with data- attributes:", `${dataMissing}`)

    return agencyCard;
}

function onload() {
    let currentParams = getParams();
    let { agency, year } = currentParams;
    updateURL(agency, year);

    let agencyData = new Promise(function(resolve, reject) {
        resolve(hydrateHTML(agency, year));
    }).then(function(result) {
        styleLetterGrade(result.agency_grade)
        return hydrateCharts(result);
    })
}

onload();