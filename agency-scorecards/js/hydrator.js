var hydrator = (function() {

    // Variables

    let selectElement;
    let letterGradeBlock;
    let mainElement;

    var public = {};

    // Private Methods

    var updateAgencySelector = function(acronym) {
        selectElement.value = acronym;
    }

    /*!
     * Style the background color of the div representing an agency's grade
     * @param  {String} grade  The raw grade found in the data
     * @return {String}        The 
     */
    var styleLetterGrade = function(grade, gradeElement) {
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

        gradeElement.setAttribute("style", `background-color: ${gradeColor};`);
        return gradeFormatted;
    }

    var hydrateScoreCardElements = function(texts, agencyData) {
        let dataMissing = [];

        // Hydrate values on each HTML element from data
        for (const [key, value] of Object.entries(agencyData)) {

            // Gather list of HTML elements with corresponding data attribute
            // https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes
            let nodeList = mainElement.querySelectorAll(`[data-${key}]`);

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
        const fiscalYearNodeList = document.querySelectorAll('[data-fiscal_year]');
        const previousFiscalYearNodeList = document.querySelectorAll('[data-fiscal_year_previous]');
        const primeFootnoteNode = document.querySelector('[data-prime_footnote]');
        const subFootnoteNode = document.querySelector('[data-sub_footnote]');

        primeFootnoteNode.innerHTML = texts.prime_footnote;
        subFootnoteNode.textContent = texts.sub_footnote;

        if (fiscalYearNodeList.length > 0) {
            fiscalYearNodeList.forEach((node) => {
                node.textContent = texts.fiscal_year;
            });
        }

        if (previousFiscalYearNodeList.length > 0) {
            previousFiscalYearNodeList.forEach(function(node) {
                node.textContent = texts.fiscal_year - 1;
            });
        }

        console.debug(`Unable to locate HTML elements with data- attributes: ${dataMissing}`);

        return dataMissing;
    }

    public.hydrateHomePage = data => {
        const dataMissing = [];
        const mainElement = document.querySelector('table');
        const { fiscal_year, prime_footnote, sub_footnote } = data;

        const fiscalYearTitle = document.querySelector(`[data-fiscal_year]`);
        // const primeFootnote = document.querySelector(`[data-prime_footnote]`);
        // const subFootnote = document.querySelector(`[data-sub_footnote]`);

        fiscalYearTitle.textContent = fiscal_year;
        // primeFootnote.textContent = prime_footnote;
        // subFootnote.textContent = sub_footnote;
      
        for (const element of data.departments) {
          const agencyAcronym = element.department_acronym;
          const firstUrlElement = mainElement.querySelector(`[data-${agencyAcronym}-url_1]`);
          const secondUrlElement = mainElement.querySelector(`[data-${agencyAcronym}-url_2]`);
          const gradeElement = mainElement.querySelector(`[data-${agencyAcronym}-agency_grade]`);
          const scoreElement = mainElement.querySelector(`[data-${agencyAcronym}-agency_score]`);

          firstUrlElement.href = `scorecard.html?agency=${agencyAcronym}&year=2023`;
          secondUrlElement.href = `scorecard.html?agency=${agencyAcronym}&year=2023`;
          gradeElement.textContent = element.agency_grade;
          scoreElement.textContent = element.agency_score;
        }
      
        console.debug(`Unable to locate HTML elements with data- attributes: ${dataMissing}`);
      
        return dataMissing;
      }


    public.hydrateScoreCard = function(texts, agencyData) {
        hydrateScoreCardElements(texts, agencyData);
        styleLetterGrade(agencyData.agency_grade, letterGradeBlock);
        updateAgencySelector(agencyData.department_acronym)
    }

    public.init = function(sE, lGB, mE) {
        selectElement = sE;
        letterGradeBlock = lGB;
        mainElement = mE;
    }

    // Return the Public APIs

    return public;

})();