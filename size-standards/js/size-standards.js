let sizeStandards = (function() {

    // Steps in the Size Standards process:
    // start -> search -> size -> result

    // Variables

    let containerElement; // DOM Element for this module to attach to

    // Individual variables representing the current company's stats
    let companyAssets;
    let companyEmployees;
    let companyOilBarrels;
    let companyRevenue;

    let currentNAICS = []; // Dynamic list of NAICS being searched for
    let NAICS; // Static list/reference of all NAICS codes

    let apiURLs = {
        dev: 'https://sba-gov-yumi.s3.amazonaws.com/size-standards/data/naics.json',
        prod: 'https://api.sba.gov/naics/naics.json'
    }

    // Methods

    let public = {};

    // Data handling

    /*!
     * Populating search list with a NAICS code - this does modify the DOM
     * @param  {String}  naics  A NAICS code id
     * @return {Array}          Current list of NAICS to be searched
     */
    let addSearch = function(naics) {
        console.debug(`sizeStandards.addSearch(${naics})`);

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
        newSearchItemDescription.textContent = getNAICS(naics).description;

        // Clear out input box
        let inputElement = document.querySelector("#search-input");
        inputElement.value = '';

        // Add value to Array to-be-searched
        currentNAICS.push(naics);

        NAICS.filter(function(value) {
            // Exceptions
            if (value.id.includes('_Except')) {
                if (value.id.startsWith(naics)) {
                    currentNAICS.push(value.id);
                }
            }
        })

        // Clear flash message
        flash();

        return currentNAICS;
    }

    /*!
     * Guard function that takes a code and returns proper display String for a code's size limit
     * @param  {Object}  code   NAICS object
     * @return {String}         String representing the limit, which is used for display
     */
    let calculateLimit = function(code) {
        console.debug(`sizeStandards.calculateLimit(${code}`);

        if (code.employeeCountLimit != null) {
            return formatEmployeeCountLimit(code.employeeCountLimit) + ' employees';
        }

        if (code.revenueLimit != null) {
            return formatRevenueLimit(code.revenueLimit) + ' annual revenue';
        }

        if (code.assetLimit != null) {
            return formatAssetLimit(code.assetLimit) + ' in assets';
        }

    }

    /*!
     * For an Array of NAICS codes, determine if they qualify as small given current company data
     * @param  {Array}  arr     List of NAICS codes to check the current company's size against
     * @return {Array}          Array of codes augmented with isSmall boolean attribute
     */
    let determineSizes = function(arr) {
        console.debug(`sizeStandards.determineSizes(${arr}`);

        const sizes = [];

        // Loop through each NAICS code
        arr.forEach(function(code) {

            // Take each NAICS code and hydrate it from reference data
            let fullCode = getNAICS(code);

            // Special case for Petroleum Refineries
            if (fullCode.id === '324110') {
                console.debug(`Petroleum Refineries special case!!!`);
                if (Number(companyOilBarrels) <= 200000) {
                    console.debug(`For ${fullCode.id}: ${companyOilBarrels} is less than OilBarrelLimit of 2000`);
                    if (parseInt(companyEmployees) <= parseInt(fullCode.employeeCountLimit)) {
                        console.debug(`For ${fullCode.id}: ${companyEmployees} is less than EmployeeCount Limit ${fullCode.employeeCountLimit}`);
                        fullCode.isSmall = true;
                        sizes.push(fullCode);
                        return;
                    } else {
                        fullCode.isSmall = false;
                    }
                } else {
                    fullCode.isSmall = false;
                }

                return sizes.push(fullCode);;
            }

            if (fullCode.employeeCountLimit) {
                const companyEmployeesNumber = parseInt(companyEmployees);
                const employeeCountLimitNumber = parseInt(fullCode.employeeCountLimit)

                if (companyEmployeesNumber <= employeeCountLimitNumber) {
                    console.debug(`For ${fullCode.id}: companyEmployees ${companyEmployees} is less than EmployeeCountLimit ${fullCode.employeeCountLimit}`);
                    fullCode.isSmall = true;
                    sizes.push(fullCode);
                    return;
                } else {
                    fullCode.isSmall = false;
                }
            }

            if (fullCode.revenueLimit) {
                let realDollarLimit = Number(fullCode.revenueLimit) * 1000000;
                if (Number(companyRevenue) <= realDollarLimit) {
                    console.debug(`For ${fullCode.id}: companyRevenue ${companyRevenue} is less than than ${realDollarLimit}`);
                    fullCode.isSmall = true;
                    sizes.push(fullCode);
                    return;
                } else {
                    fullCode.isSmall = false;
                }
            }

            if (fullCode.assetLimit) {
                let realAssetLimit = Number(fullCode.assetLimit) * 1000000;
                if (Number(companyAssets) <= realAssetLimit) {
                    console.debug(`For ${fullCode.id}: companyAssets ${companyAssets} is less than ${realAssetLimit}`);
                    fullCode.isSmall = true;
                    sizes.push(fullCode);
                    return;
                } else {
                    fullCode.isSmall = false;
                }
            }

            sizes.push(fullCode);
        })

        return sizes;
    }

    /*!
     * Send flash messages in case of lack of data loading or missing user input
     * @param  {String}  msg     Message to display on screen
     * @return {Boolean}         True if valid element was found to flash against, otherwise false
     */
    let flash = function(msg) {
        console.debug(`sizeStandards.flash(${msg})`);

        let flashElement = document.querySelector('#flash');

        if (flashElement) {
            if (msg) {
                flashElement.textContent = msg;
                flashElement.classList.remove('hidden');
                return true;
            } else {
                flashElement.classList.add('hidden');
                return true;
            }
        }

        return false;
    }

    /*!
     * Retrieve NAICS code reference representing size standards table
     * @param  {String}  url   Location of JSON file containing NAICS data
     * @return {Object}        JSON representation of the current size standards
     */
    let fetchNAICS = function(url) {
        console.debug(`sizeStandards.fetchNAICS(${url})`);

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
            console.debug(`sizeStandards.fetchNAICS() succcess`);

            NAICS = data;

            return data;
        }).catch(function(err) {
            // err is the raw response
            console.warn(`sizeStandards.fetchNAICS() failed`, err.status, err.statusText, err.url);

            flash(`Unable to load NAICS codes, error ${err.status}: ${err.statusText}`);

            return err;
        })
    };

    /*!
     * Format asset limit for display
     * @param  {String}  totalAssetLimit    assetLimit in millions of dollars (e.g. 600)
     * @return {String}                     Formatted value for display (e.g. $600M)
     */
    let formatAssetLimit = function(totalAssetLimit) {
        console.debug(`sizeStandards.formatAssetLimit(${totalAssetLimit})`);

        let result = Number(totalAssetLimit)
            .toString()
            .split(/(?=(?:\d{3})+(?:\.|$))/g)
            .join(',');
        result = '$' + result + 'M';

        return result;
    }

    /*!
     * Format employee limit for display
     * @param  {String}  employeeCountLimit Number of employees (e.g. 5000)
     * @return {String}                     Formatted value for display (e.g. 5,000)
     */
    let formatEmployeeCountLimit = function(employeeCountLimit) {
        console.debug(`sizeStandards.formatEmployeeCountLimit(${employeeCountLimit})`);
        let result = Number(employeeCountLimit)
            .toString()
            .split(/(?=(?:\d{3})+(?:\.|$))/g)
            .join(',');

        return result;
    }

    /*!
     * Format revenue limit for display
     * @param  {String}  revenueLimit   Revenue in millions of dollars (e.g. 50)
     * @return {String}                 Formatted value for display (e.g. $50,000,000)
     */
    let formatRevenueLimit = function(revenueLimit) {
        console.debug(`sizeStandards.formatRevenueLimit(${revenueLimit})`);
        let annualRevenueConstant = 1000000;
        let result = (Number(revenueLimit) * annualRevenueConstant)
            .toString()
            .split(/(?=(?:\d{3})+(?:\.|$))/g)
            .join(',');
        result = '$' + result;

        return result;
    }

    /*!
     * Returns a full NAICS object with all properties
     * @param  {String}  naics  id representing a NAICS code
     * @return {Object}         Full NAICS Object with related metadata
     */
    let getNAICS = function(naics) {
        console.debug(`sizeStandards.getNAICS(${naics})`);

        if (typeof(naics) === 'string') {
            // Need to trim out _Except characters, if we're only returning primary NAICS codes (not exceptions)
            // This was originally requested by the stakeholder, then reversed (07/13/22)
            // Commented code remains in case minds change again, but can be deleted after launch
            // if (naics.length > 6) {
            //     // Trim first 6 characters
            //     naics = naics.substring(0, 6);
            // }
            return NAICS.find(code => code.id === naics);
        }

        // This is hacky, but it's necessary to support the Exception use case
        if (typeof(naics) === 'object') {
            return naics;
        }

        console.debug(`sizeStandards.getNAICS(${naics}) not a String or an Object`);
        return null;
    }

    /*!
     * Creates list of Strings combining NAICS codes + descriptions for autocomplete
     * @return {Array}  Containing Objects (e.g. {label: '111110 - Soybean Farming', value: '111110'} )
     */
    let generateAutocompleteList = function() {
        console.debug(`sizeStandards.generateAutocompleteList()`);

        // Remove exceptions and empty rows from the data
        let listFiltered = NAICS.filter(function(value) {

            // Exceptions
            if (value.id.includes('_Except')) {
                return false;
            }

            // Empty rows
            if (value.id === '') {
                return false;
            }

            return true;
        })

        // Format list into 'id - decription' for text searching on either
        let listFormatted = listFiltered.map((code) => {

            let codeItem = {
                label: `${code.id} - ${code.description}`,
                value: code.id
            }

            return codeItem;
        });

        console.debug(`sizeStandards.generateAutocompleteList() returning ${listFormatted.length} entries`);
        return listFormatted;
    }

    /*!
     * Generate HTML to display size status for a given NAICS code
     * @param  {Object}  result     NAICS object
     * @return {String}             HTML representing single NAICS result
     */
    let generateResultHTML = function(result) {
        console.debug(`sizeStandards.generateResultHTML(${result})`);

        let resultHTML = '';
        let sizeLimit = calculateLimit(result);
        let sizeString;

        if (result.isSmall) {
            sizeString = '<i class="fa fa-check-circle" area-hidden="true" style="color: #609f00;;"></i><br>YES';
        } else {
            sizeString = '<i class="fa fa-times-circle" area-hidden="true" style="color: #e21234;"></i><br>NO';
        }

        let oilLimit = '';

        if (result.id === '324110') {
            oilLimit = "200,000 barrels";
        } else {
            oilLimit = '';
        }

        resultHTML = `<div class="flex">
                        <span><strong>${result.id}</strong> <br> ${result.description} </span>
                        <span><strong>Size Standard</strong> <br> ${sizeLimit} <br> ${oilLimit}</span>
                        <span>${sizeString}</span>
                        <br>
                      </div>`;
        
        const index = currentNAICS.indexOf(result.id);
        if (index > -1) { // only splice array when item is found
            currentNAICS.splice(index, 1); // 2nd parameter means remove one item only
        }
        
        return resultHTML;
    }

    /*!
     * Generate HTML to display exception status status for a given NAICS code
     * @param  {Object}  result     NAICS object
     * @return {String}             HTML representing single NAICS exceptions
     */

    let searchCurrentNaicsException = function (result) {
        return NAICS.filter(function(value) {
            // Exceptions
            if (value.id.includes('_Except')) {
                if (value.id.startsWith(result.id)) {
                    return true;
                }
            }
        })
    }

    let generateExceptionHTML = function(exceptionList) {
        let exceptions = '';
        let exceptionHTML = '';

        // Test the exceptions for sizing 
        let listFilteredandSized = determineSizes(exceptionList);

        // If there are any exceptions
        if (exceptionList.length) {
            // Push one footnote in this array per NAICS, which its Except family to only print once
            let currentNAICSFootnote = [];

            // Loop through them and generate each as if they were a separate result
            listFilteredandSized.forEach(function(exception) {
                if (currentNAICSFootnote && currentNAICSFootnote.length <= 0) {
                    currentNAICSFootnote = exception.footnote
                }
                exceptions = exceptions + generateResultHTML(exception);
            });
        
            // Wrap the entire list in a details block for UX
            exceptionHTML = 
                `<details open>
                    <summary class="summary">Exceptions may apply</summary>
                    ${exceptions}
                    ${generateFootnoteHTML(currentNAICSFootnote)}
                </details>`;
        }

        return exceptionHTML;
    }

    /*!
     * Generate HTML to display footnotes related to a given NAICS code
     * @param  {Object}  result     NAICS object
     * @return {String}             HTML representing single NAICS footnotes
     */
    let generateFootnoteHTML = function(footnote) {
        console.debug(`sizeStandards.generateFootnoteHTML(${footnote})`);

        let footnoteHTML = '';

        if (footnote) {
            let combinedFootnote = '';

            footnote.forEach(function(eachFootnote, index) {

                if (index >= 1) {
                    const numberToLetter = (index + 9).toString(36).toUpperCase()

                    combinedFootnote += `<p>${numberToLetter}. ${eachFootnote}</p>`
                } else {
                    combinedFootnote += `<p>${eachFootnote}</p>`
                }
            })

            footnoteHTML = `<details class="footnote">
                <summary>Footnotes may apply</summary>
                <p>
                    ${combinedFootnote}
                </p>
            </details>`
        }

        return footnoteHTML;
    }

    /*!
     * Generate HTML parent function that orchestrates a full response screen
     * @return {String}     HTML representing all results
     */
    let generateResults = function() {
        console.debug(`sizeStandards.generateResults()`);

        const currentNAICSWithoutExcepts = currentNAICS.filter(naics => {
            if (!naics.includes('_Except')) {
                return true
            }
        });

        let results = determineSizes(currentNAICSWithoutExcepts);

        let resultsHTML = '';

        results.forEach(function(result) {
            const exceptionExist = searchCurrentNaicsException(result);

            resultsHTML = resultsHTML + `
                <div class="result">
                    ${generateResultHTML(result)}
                    ${exceptionExist.length <= 0 ? generateFootnoteHTML(result.footnote) : ``}
                    ${exceptionExist.length > 0 ? generateExceptionHTML(exceptionExist) : ``}
                </div>
                `;
        })

        return resultsHTML;
    }

    /*!
     * Test the currentNAICS Array to see if any require we know the company's assets
     * @return {Boolean}    True if we should ask the asset question
     */
    let shouldAskAssets = function() {
        console.debug(`sizeStandards.shouldAskAssets()`);

        let assetQuestion = false;

        currentNAICS.forEach(function(code) {

            if (getNAICS(code).assetLimit) {
                assetQuestion = true;
            }
        })

        console.debug(`sizeStandards.shouldAskAssets() ${assetQuestion}`);
        return assetQuestion;
    }

    /*!
     * Test the currentNAICS Array to see if any require we know the company's employees
     * @return {Boolean}    True if we should ask the employee question
     */
    let shouldAskEmployees = function() {
        console.debug('sizeStandards.shouldAskEmployees()');

        let employeeQuestion = false;

        currentNAICS.forEach(function(code) {
            if (getNAICS(code).employeeCountLimit) {
                employeeQuestion = true;
            }
        })

        console.debug(`sizeStandards.shouldAskEmployees() ${employeeQuestion}`);
        return employeeQuestion;
    }

    /*!
     * Test the currentNAICS Array to see if any require we know the company's revenue
     * @return {Boolean}    True if we should ask the revenue question
     */
    let shouldAskRevenue = function() {
        console.debug('sizeStandards.shouldAskRevenue()')

        let revenueQuestion = false;

        currentNAICS.forEach(function(code) {
            if (getNAICS(code).revenueLimit) {
                revenueQuestion = true;
            }
        })

        console.debug(`sizeStandards.shouldAskRevenue() ${revenueQuestion}`);
        return revenueQuestion;
    }

    /*!
     * Test the currentNAICS Array to see if any require we know the company's oil barrels
     * @return {Boolean}    True if we should ask the oil barrel question
     */
    let shouldAskOilBarrels = function() {
        console.debug('sizeStandards.shouldAskOilBarrels()')
        let oilBarrels = false;

        currentNAICS.forEach(function(code) {
            if (getNAICS(code).id === '324110') {
                oilBarrels = true;
            }
        })

        console.debug(`sizeStandards.shouldAskOilBarrels() ${oilBarrels}`);
        return oilBarrels;
    }

    /*!
     * Returns HTML to load the Start Page
     * @return {String}     HTML
     */
    let startPage = function() {
        console.debug(`sizeStandards.startPage()`);

        return `<h2 id="heading">Size Standards Tool</h2>
                    <form action="javascript:navigate('search');">
                    <img src="img/size-standards-ruler-business.png" alt="Illustration of a business being measured by rulers." />
                    <p class="question">Do you qualify as a small business for government contracting purposes?</p>
                    <p id="flash" class="hidden"></p>
                    <input class="button" type="submit" value="start">
                </form>`;
    }

    /*!
     * Returns HTML to load the Search Page
     * @return {String}     HTML
     */
    let searchPage = function() {
        console.debug(`sizeStandards.searchPage()`);

        return `<div class="width70">
                    <h2>What's your industry?</h2>
                    <p>Select your 6-digit NAICS code</p>
                    <form action="javascript:navigate('size');">

                        <input class="awesomplete" id="search-input" placeholder="Search by NAICS code or keyword" />
                        <br>
                        <table class="hidden" id="search-list">
                            <caption>Search List</caption>
                            <tbody>
                                <tr>
                                    <td>Code</td>
                                    <td>Description</td>
                                </tr>
                            </tbody>
                        </table>
                        <p>The North American Industry Classification System (NAICS) classifies businesses according to type of economic activity.</p>
                        <p>If you don't know which NAICS code to select, visit <a href="https://www.census.gov/NAICS" target="_blank">www.census.gov/NAICS</a> for a comprehensive search and listing.</p>
                        <p id="flash" class="hidden"></p>
                        <input class="button" type="submit" value="search" />
                    </form>
                </div>`;
    }


    /*!
     * Returns HTML to load the Assets Question
     * @return {String}     HTML
     */
    let sizePageAssets = function() {
        console.debug(`sizeStandards.sizePageAssets()`);

        return `<div class="width70">
                    <form action="javascript:setCompanySize('assets');">
                        <h2>How many total assets in the last year?</h2>
                        <br>
                        <label>One-year Average<br>
                            <input class="input-number" type="number">
                        </label>
                        <p>
                            A financial institution's assets are determined by averaging the assets reported on its four quarterly financial statements for the preceding year. 
                            "Assets" means the assets defined according to the Federal Financial Institutions Examination Council 041 call report form for NAICS Codes 522110, 522120, 522190, and 522210 and the National Credit Union Administration 5300 call report form for NAICS code 522130.
                        </p>
                        <p id="flash" class="hidden"></p>
                        <input class="button" type="submit" value="Check Size" />
                    </form>
                </div>`;
    }

    /*!
     * Returns HTML to load the Employee Question
     * @return {String}     HTML
     */
    let sizePageEmployee = function() {
        console.debug(`sizeStandards.sizePageEmployee()`);

        return `<div class="width70">
                    <form action="javascript:setCompanySize('employee');">
                    <h2>How many employees?</h2>
                    <br>
                    <label>Number of employees<br><input class="input-number" type="number"></label>
                    <p>
                        This should be the average number of full-time or part-time employees over the last 24 months.
                    </p>
                    <p id="flash" class="hidden"></p>
                    <input class="button" type="submit" value="Check Size" />
                    </form>
                </div>`;
    }

    /*!
     * Returns HTML to load the Revenue Question
     * @return {String}     HTML
     */
    let sizePageRevenue = function() {
        console.debug(`sizeStandards.sizePageRevenue()`);

        return `<div class="width70">
                    <form action="javascript:setCompanySize('revenue');">
                    <h2>How much average annual receipts or revenue?</h2>
                    <br>
                    <label>Five-year Average<br><input class="input-number" type="number"></label>
                    <p>
                        Your average annual receipts/revenue is generally calculated as your total receipts/revenue or total income plus cost of goods sold (including all affiliates, if any) over the latest completed five (5) fiscal years divided by five (5). See 13 CFR 121.104
                        for details.
                    </p>
                    <p id="flash" class="hidden"></p>
                    <input class="button" type="submit" value="Check Size" />
                    </form>
                </div>`;
    }

    /*!
     * Returns HTML to load the Oil Question
     * @return {String}     HTML
     */
    let sizePageOil = function() {
        console.debug(`sizeStandards.sizePageOil()`);

        return `<div class="width70">
                    <form action="javascript:setCompanySize('oil');">
                    <h2>How many barrels of oil does your company refine?</h2>
                    <br>
                    <label>Total barrels per calendar day<br><input class="input-number" type="number"></label>
                    <p>
                        To qualify as small for purposes of Government procurement, the petroleum refiner, including its affiliates, must be a concern that has either no more than 1,500 employees or no more than 200,000 barrels per calendar day total Operable Atmospheric Crude Oil Distillation capacity.  
                    </p>
                    <p>
                        Capacity includes all domestic and foreign affiliates, all owned or leased facilities, and all facilities under a processing agreement or an arrangement such as an exchange agreement or a throughput.  To qualify under the capacity size standard, the firm, together with its affiliates, must be primarily engaged in refining crude petroleum into refined petroleum products.  
                    </p>
                    <p>
                        A firm's “primary industry” is determined in accordance with 13 CFR § 121.107.
                    </p>
                    <p id="flash" class="hidden"></p>
                    <input class="button" type="submit" value="Check Size" />
                    </form>
                </div>`;
    }


    /*!
     * Returns HTML representing the entire Result Page
     * @param  {String}  renderedResult  HTML representing the results for each NAICS code
     * @return {String}  HTML
     */
    let resultPage = function(renderedResult) {
        console.debug(`sizeStandards.resultPage()`);

        let adviceString = '';

        if (renderedResult.includes('YES')) {
            adviceString = '<p id="success text">You may be eligible to participate in an <a href="https://www.sba.gov/contracting">SBA contracting program</a>.</p>';
        } else {
            adviceString = '<p id="failure text">Your business is too large to meet the current small size standards.</p>'
        }

        return `<div class="width70">
                    <h2>Are you a small business eligible for government contracting?</h2>
                    <div class="flex" id="results">

                    </div>
                    <br>
                    ${renderedResult}
                    ${adviceString}
                    <div class="flex">
                        <div class="border">
                            <p>Learn more about small business size standards.</p>
                            <h3>Office of Size Standards</h3>
                            <div>
                                <i className="fa fa-map-marker" aria-hidden="true"></i>
                                <p>409 3rd Street, SW</p>
                                <p>Washington, DC 20416</p>
                                <i className="fa fa-phone" aria-hidden="true"></i>
                                <p>202-205-6618</p>
                                <i className="fa fa-envelope" aria-hidden="true"></i>
                                <p><a href="mailto:sizestandards@sba.gov">sizestandards@sba.gov</a></p>
                            </div>
                        </div>
                        <div class="border">
                            <p>Find out how you can sell to the Federal Government.</p>
                            <h3>Office of Contracting</h3>
                            <div>
                                <i className="fa fa-map-marker" aria-hidden="true"></i>
                                <p>409 3rd Street, SW</p>
                                <p>Washington, DC 20416</p>
                                <i className="fa fa-phone" aria-hidden="true"></i>
                                <p>202-205-6621</p>
                                <i className="fa fa-envelope" aria-hidden="true"></i>
                                <p><a href="mailto:contracting@sba.gov ">contracting@sba.gov</a></p>
                            </div>
                        </div>

                    </div>
                    <form action="javascript:navigate('start');">
                        <input class="button" type="submit" value="Start Over" />
                    </form>
                </div>`;
    }

    /*!
     * Store user input as variables corresponding to each dimension of size
     * @param  {String}  type    The company attribute type (assets, employees, revenue, or oil barrels)
     */
    public.setCompanySize = function(type) {
        console.debug(`sizeStandards.setCompanySize(${type})`);

        let inputElement = document.querySelector('.input-number');

        switch (type) {
            case 'assets':
                companyAssets = inputElement.value;
                break;
            case 'employee':
                companyEmployees = inputElement.value;
                break;
            case 'revenue':
                companyRevenue = inputElement.value;
                break;
            case 'oil':
                companyOilBarrels = inputElement.value;
                break;
            default:
                console.warn(`sizeStandards.setCompanySize(): Did not recognize input ${type}.`);
        }

        this.render('size');
    }

    /*!
     * Master render function resets variables on start and controls logic around UI display
     * @param  {String}  page    Page to display for the stage (start, search, size, result)
     */
    public.render = function(page) {
        console.debug(`sizeStandards.render(${page})`);

        switch (page) {
            case 'start':
                companyAssets = null;
                companyEmployees = null;
                companyOilBarrels = null;
                companyRevenue = null;
                currentNAICS = [];

                containerElement.innerHTML = startPage();
                break;

            case 'search':
                containerElement.innerHTML = searchPage();

                let autocompleteElement = document.querySelector("#search-input");

                new Awesomplete(autocompleteElement, {
                    list: generateAutocompleteList()
                });

                autocompleteElement.addEventListener("awesomplete-selectcomplete", (event) => {
                    addSearch(event.text.value);
                });

                break;

            case 'size':
                if (!currentNAICS.length) {
                    // This will return the user to the search page!
                    this.render('search');
                    flash('You must select at least one NAICS code.');
                    break;
                }

                if (!companyEmployees) {
                    if (shouldAskEmployees()) {
                        containerElement.innerHTML = sizePageEmployee();
                        break;
                    }
                }

                if (!companyRevenue) {
                    if (shouldAskRevenue()) {
                        containerElement.innerHTML = sizePageRevenue();
                        break;
                    }
                }

                if (!companyAssets) {
                    if (shouldAskAssets()) {
                        containerElement.innerHTML = sizePageAssets();
                        break;
                    }
                }

                if (!companyOilBarrels) {
                    if (shouldAskOilBarrels()) {
                        containerElement.innerHTML = sizePageOil();
                        break;
                    }
                }

            case 'result':
                let sizeResult = generateResults(currentNAICS);

                containerElement.innerHTML = resultPage(sizeResult);

                break;

            default:
                console.warn(`sizeStandards.render(), case: default: Sorry, no type / limit detected for ${page}.`);
                containerElement.innerHTML = startPage();
        }
    };

    /*!
     * Initialize the module, retrieving data and attaching to the DOM
     * @param  {Element}  ele    Container DOM element that this module will manipulate forward
     * @return {Array}           Returns the JSON data fetched from a remote source
     */
    public.init = function(ele) {
        console.debug(`sizeStandards.init(${ele.id})`);

        // Data Loader
        if (!NAICS) {
            console.debug(`sizeStandards.init(): Hostname detected: ${window.location.hostname}`);
            let url = window.location.hostname.includes('sba.gov') ? apiURLs.prod : apiURLs.dev;
            console.debug(`sizeStandards.init(): Calling API at: ${url}`)
            NAICS = fetchNAICS(url);
        }

        // HTML Renderer
        containerElement = ele;
        console.debug(`sizeStandards.init(): Renderer attached: ${containerElement.title}`);
        this.render('start');

        console.debug(`sizeStandards.init() initialized`);
        console.debug(NAICS);
        return NAICS;
    };

    // Return the Public APIs
    return public;

})();