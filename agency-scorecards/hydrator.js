var hydrator = (function() {

    // Variables

    var public = {};

    // Private Methods

    /*!
     * Style the background color of the div representing an agency's grade
     * @param  {String} grade  The raw grade found in the data
     * @return {String}        The 
     */
    var styleLetterGrade = function(grade) {
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
        return gradeFormatted;
    }

    var hydrateDataElements = function(data) {

        let dataMissing = [];

        // Hydrate values on each HTML element from data
        for (const [key, value] of Object.entries(data)) {

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

        console.debug(`Unable to locate HTML elements with data- attributes: ${dataMissing}`)

        return dataMissing;
    }


    public.hydrate = function(agencyData, letterElement) {
        hydrateDataElements(agencyData);
        styleLetterGrade(agencyData.agency_grade);
    }

    // Return the Public APIs

    return public;

})();