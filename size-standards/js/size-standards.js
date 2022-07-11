let sizeStandards = (function() {

    // Steps in the Size Standards process:
    // start -> search -> size -> result

    // Variables

    let containerElement;

    let companyEmployees;
    let companyOilBarrels;
    let companyRevenue;

    let currentNAICS = [];
    let NAICS;

    let apiURLs = {
        dev: 'https://sba-gov-yumi.s3.amazonaws.com/size-standards/data/naics.json',
        prod: 'https://www.sba.gov/naics'
    }

    // Methods

    let public = {};

    // Data handling

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

            return data;
        }).catch(function(err) {
            // err is the raw response
            console.warn(`fetchNAICS() failed`, err.status, err.statusText, err.url);
            flash(`Unable to load NAICS codes, error ${err.status}: ${err.statusText}`);
            return err;
        })
    };

    let formatRevenueLimit = function(revenueLimit) {
        let annualRevenueConstant = 1000000;
        let result = (Number(revenueLimit) * annualRevenueConstant)
            .toString()
            .split(/(?=(?:\d{3})+(?:\.|$))/g)
            .join(',');
        result = '$' + result;

        return result;
    }

    let formatEmployeeCountLimit = function(employeeCountLimit) {
        let result = Number(employeeCountLimit)
            .toString()
            .split(/(?=(?:\d{3})+(?:\.|$))/g)
            .join(',');

        return result;
    }

    // Creates list of Strings combining NAICS codes + descriptions for autocomplete
    let generateAutocompleteList = function() {

        // Remove exceptions and empty rows from the data
        let listFiltered = NAICS.filter(function(value, index, arr) {

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

        return listFormatted;
    }

    let determineSizes = function(arr) {
        let sizes = [];

        arr.forEach(function(code) {
            console.debug(code);

            let fullCode = getNAICS(code);

            console.debug(fullCode);

            // Special case for Petroleum Refineries
            if (fullCode.id === '324110') {
                if (2000 >= companyOilBarrels && fullCode.employeeCountLimit >= companyEmployees) {
                    console.debug(`OilBarrelLimit 2000 is greater than ${companyOilBarrels} and EmployeeCount Limit ${fullCode.employeeCountLimit} is greater than ${companyEmployees}`);
                    fullCode.isSmall = true;
                    sizes.push(fullCode);
                    return;
                }
            }

            if (fullCode.employeeCountLimit) {
                if (companyEmployees <= fullCode.employeeCountLimit) {
                    console.debug(`companyEmployees ${companyEmployees} is less than EmployeeCountLimit ${fullCode.employeeCountLimit}`);
                    fullCode.isSmall = true;
                    sizes.push(fullCode);
                    return;
                }
            }

            if (fullCode.revenueLimit) {
                let realDollarLimit = fullCode.revenueLimit * 1000000;

                if (companyRevenue <= realDollarLimit) {
                    console.debug(`companyRevenue ${companyRevenue} is less than than ${realDollarLimit}`);
                    fullCode.isSmall = true;
                    sizes.push(fullCode);
                    return;
                }
            }

            sizes.push(fullCode);
        })

        return sizes;
    }

    let generateResults = function() {
        let results = determineSizes(currentNAICS);
        console.debug('Printing all current NAICS');


        // currentNAICS.forEach(function(code) {
        //     console.debug(code);

        //     let fullCode = getNAICS(code);

        //     console.debug(fullCode);

        //     // Special case for Petroleum Refineries
        //     if (fullCode.id === '324110') {
        //         if (2000 >= companyOilBarrels && fullCode.employeeCountLimit >= companyEmployees) {
        //             console.debug(`OilBarrelLimit 2000 is greater than ${companyOilBarrels} and EmployeeCount Limit ${fullCode.employeeCountLimit} is greater than ${companyEmployees}`);
        //             fullCode.isSmall = true;
        //             results.push(fullCode);
        //             return;
        //         }
        //     }

        //     if (fullCode.employeeCountLimit) {
        //         if (companyEmployees <= fullCode.employeeCountLimit) {
        //             console.debug(`companyEmployees ${companyEmployees} is less than EmployeeCountLimit ${fullCode.employeeCountLimit}`);
        //             fullCode.isSmall = true;
        //             results.push(fullCode);
        //             return;
        //         }
        //     }

        //     if (fullCode.revenueLimit) {
        //         let realDollarLimit = fullCode.revenueLimit * 1000000;

        //         if (companyRevenue <= realDollarLimit) {
        //             console.debug(`companyRevenue ${companyRevenue} is less than than ${realDollarLimit}`);
        //             fullCode.isSmall = true;
        //             results.push(fullCode);
        //             return;
        //         }
        //     }

        //     results.push(fullCode);
        // })

        console.debug('End determining size')

        let resultsHTML = '';

        console.debug("Results: " + results.length)
        console.debug(results);

        results.forEach(function(result) {
            console.debug("Result:")
            console.debug(result);
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


            let exceptions = '';

            let listFiltered = NAICS.filter(function(value) {
                // Exceptions
                if (value.id.includes('_Except')) {
                    if (value.id.startsWith(result.id)) {
                        return true;
                    }
                }
            })

            if (listFiltered.length) {
                let exceptionHTML = '';

                listFiltered.forEach(function(exception) {
                    exceptionHTML = exceptionHTML + `
                                                    <div class="result">
                                                        <div class="flex">
                                                            <span><strong>${exception.id}</strong> <br> ${exception.description} </span>
                                                            <span><strong>Size Standard</strong> <br>  <br> ${oilLimit}</span>
                                                            <span></span>
                                                            <br>
                                                        </div>
                                                    </div>`;
                })

                exceptions = `<details>
                                <summary>Exceptions may apply</summary>
                                ${exceptionHTML}
                              </details>`;
            }

            let footnote = '';

            if (result.footnote) {
                footnote = `<details>
                                <summary>Footnotes may apply</summary>
                                <p>
                                ${result.footnote}
                                </p>
                            </details>`
            }

            resultsHTML = resultsHTML + `
                                        <div class="result">
                                            <div class="flex">
                                                <span><strong>${result.id}</strong> <br> ${result.description} </span>
                                                <span><strong>Size Standard</strong> <br> ${sizeLimit} <br> ${oilLimit}</span>
                                                <span>${sizeString}</span>
                                                <br>
                                            </div>
                                            ${exceptions}
                                            ${footnote}
                                        </div>
                                        `;
        })

        console.debug("ResultsHTML:")
        console.debug(resultsHTML);
        return resultsHTML;
    }

    let calculateLimit = function(code) {
        console.debug('calculateLimit()');
        console.debug(code);

        if (code.employeeCountLimit != null) {
            console.debug('Returning ' + code.employeeCountLimit);
            return formatEmployeeCountLimit(code.employeeCountLimit) + ' employees';
        }

        if (code.revenueLimit != null) {
            console.debug('Returning ' + code.revenueLimit);
            return formatRevenueLimit(code.revenueLimit) + ' annual revenue';
        }

    }

    let shouldAskEmployees = function() {
        console.debug('shouldAskEmployees()')
        let employeeQuestion = false;

        currentNAICS.forEach(function(code) {
            console.debug(getNAICS(code).employeeCountLimit);
            if (getNAICS(code).employeeCountLimit) {
                employeeQuestion = true;
            }
        })

        return employeeQuestion;
    }

    let shouldAskRevenue = function() {
        console.debug('shouldAskRevenue()')
        let revenueQuestion = false;

        currentNAICS.forEach(function(code) {
            console.debug(getNAICS(code).revenueLimit);
            if (getNAICS(code).revenueLimit) {
                console.debug('You should ask for Revenue!!')
                revenueQuestion = true;
            }
        })

        return revenueQuestion;
    }

    let shouldAskOilBarrels = function() {
        console.debug('shouldAskOilBarrels()')
        let oilBarrels = false;

        currentNAICS.forEach(function(code) {
            console.debug(getNAICS(code).id);
            if (getNAICS(code).id === '324110') {
                console.debug('You should ask for Oil Barrels!!')
                oilBarrels = true;
            }
        })

        return oilBarrels;
    }

    // Return a full NAICS object with all properties
    let getNAICS = function(naics) {

        if (typeof(naics) === 'string') {
            if (naics.length > 6) {
                // Trim first 6 characters
                naics = naics.substring(0, 6);
            }
        } else {
            console.debug(`sizeStandards.getNAICS(${naics}) not a String`)
        }

        return NAICS.find(code => code.id === naics);

    }

    let startPage = function() {
        return `<h2 id="heading">Size Standards Tool</h2>
                    <form action="javascript:navigate('search');">
                    <img src="img/size-standards-ruler-business.png" alt="Illustration of a business being measured by rulers." />
                    <p class="question">Do you qualify as a small business for government contracting purposes?</p>
                    <p id="flash" class="hidden"></p>
                    <input class="button" type="submit" value="start">
                </form>`;
    }

    let searchPage = function() {
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
                        <p>If you don't know which NAICS code to select, visit census.gov for a comprehensive search and listing.</p>
                        <p id="flash" class="hidden"></p>
                        <input class="button" type="submit" value="search" />
                    </form>
                </div>`;
    }

    let sizePageEmployee = function() {
        return `<div class="width70">
                    <form action="javascript:setCompanySize('employee');">
                    <h2>How many employees?</h2>
                    <br>
                    <label>Number of employees<br><input class="input-number" type="number"></label>
                    <p>
                        This should be the average number of full-time or part-time employees over the last 12 months.
                    </p>
                    <p id="flash" class="hidden"></p>
                    <input class="button" type="submit" value="Check Size" />
                    </form>
                </div>`;
    }

    let sizePageRevenue = function() {
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

    let sizePageOil = function() {
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


    let resultPage = function(renderedResult) {

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
        newSearchItemDescription.textContent = getNAICS(naics).description;

        // Clear out input box
        let inputElement = document.querySelector("#search-input");
        inputElement.value = '';

        // Add value to array to-be-searched
        currentNAICS.push(naics);
        console.debug(currentNAICS);

        // Clear flash message
        flash();

        return currentNAICS;
    }

    let flash = function(msg) {
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

    public.setCompanySize = function(type) {
        let inputElement = document.querySelector('.input-number');

        switch (type) {
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

    // Master render function

    public.render = function(page) {

        switch (page) {
            case 'start':
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
                console.debug(currentNAICS);

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

                if (!companyOilBarrels) {
                    if (shouldAskOilBarrels()) {
                        containerElement.innerHTML = sizePageOil();
                        break;
                    }
                }

                // This will fall through to the 'result' section!

            case 'result':

                let sizeResult = generateResults(currentNAICS);
                console.debug(sizeResult);

                containerElement.innerHTML = resultPage(sizeResult);
                break;

            default:
                console.warn(`Sorry, no type / limit detected for ${page}.`);
                containerElement.innerHTML = startPage();
        }
    };

    public.init = function(ele) {
        // Data Loader
        if (!NAICS) {
            console.debug(`Hostname detected: ${window.location.hostname}`);
            let url = window.location.hostname.includes('sba.gov') ? apiURLs.prod : apiURLs.dev;
            console.debug(`Calling API at: ${url}`)
            NAICS = fetchNAICS(url);
        }

        // HTML Renderer
        containerElement = ele;
        console.debug(`Renderer attached: ${containerElement.title}`);
        this.render('start');

        console.debug(`sizeStandards initialized`);

        return NAICS;
    };

    // Return the Public APIs

    return public;

})();