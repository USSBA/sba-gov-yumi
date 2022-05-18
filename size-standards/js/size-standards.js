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
        prod: 'https://www.sba.gov/naics.json'
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

    // Creates list of Strings combining NAICS codes + descriptions for autocomplete
    let generateAutocompleteList = function() {
        let listFormatted = NAICS.map((code) => {
            let codeItem = {
                label: `${code.id} - ${code.description}`,
                value: code.id
            }

            return codeItem;
        });

        console.debug(listFormatted);
        return listFormatted;
    }

    let generateResults = function() {
        let results = [];
        console.log('Printing all current NAICS');

        currentNAICS.forEach(function(code) {
            console.log(code);

            let fullCode = getNAICS(code);

            console.log(fullCode);

            // Special case for Petroleum Refineries
            if (fullCode.id === '324110') {
                if (2000 >= companyOilBarrels && fullCode.employeeCountLimit >= companyEmployees) {
                    console.log(`OilBarrelLimit 2000 is greater than ${companyOilBarrels} and EmployeeCount Limit ${fullCode.employeeCountLimit} is greater than ${companyEmployees}`);
                    fullCode.isSmall = true;
                    results.push(fullCode);
                    return;
                }
            }

            if (fullCode.employeeCountLimit) {
                if (fullCode.employeeCountLimit >= companyEmployees) {
                    console.log(`EmployeeCountLimit ${fullCode.employeeCountLimit} is greater than ${companyEmployees}`);
                    fullCode.isSmall = true;
                    results.push(fullCode);
                    return;
                }
            }

            if (fullCode.revenueLimit) {
                let realDollarLimit = fullCode.revenueLimit * 1000000;
                console.log(realDollarLimit);
                if (realDollarLimit >= companyRevenue) {
                    console.log(`realDollarLimit ${realDollarLimit} is greater than ${companyRevenue}`);
                    fullCode.isSmall = true;
                    results.push(fullCode);
                    return;
                }
            }

            results.push(fullCode);
        })

        console.log('End determining size')

        let resultsHTML = '';

        console.log("Results: " + results.length)
        console.log(results);

        results.forEach(function(result) {
            console.log("Result:")
            console.log(result);
            let sizeLimit = calculateLimit(result);
            let sizeString;


            if (result.isSmall) {
                sizeString = 'YES';
            } else {
                sizeString = 'NO';
            }

            resultsHTML = resultsHTML + `<div class="flex">
                                            <span>${result.id} <br> ${result.description} </span>
                                            <span>Small Business Size Standards <br> ${sizeLimit}</span>
                                            <span>${sizeString}</span>
                                        </div>`;
        })

        console.log("ResultsHTML:")
        console.log(resultsHTML);
        return resultsHTML;
    }

    let calculateLimit = function(code) {
        console.log('calculateLimit()');
        console.log(code);

        if (code.employeeCountLimit != null) {
            console.log('Returning ' + code.employeeCountLimit);
            return code.employeeCountLimit + ' employees';
        }

        if (code.revenueLimit != null) {
            console.log('Returning ' + code.revenueLimit);
            return (code.revenueLimit * 1000000) + ' annual revenue';
        }

    }

    let shouldAskEmployees = function() {
        console.log('shouldAskEmployees()')
        let employeeQuestion = false;

        currentNAICS.forEach(function(code) {
            console.log(getNAICS(code).employeeCountLimit);
            if (getNAICS(code).employeeCountLimit) {
                employeeQuestion = true;
            }
        })

        return employeeQuestion;
    }

    let shouldAskRevenue = function() {
        console.log('shouldAskRevenue()')
        let revenueQuestion = false;

        currentNAICS.forEach(function(code) {
            console.log(getNAICS(code).revenueLimit);
            if (getNAICS(code).revenueLimit) {
                console.log('You should ask for Revenue!!')
                revenueQuestion = true;
            }
        })

        return revenueQuestion;
    }

    let shouldAskOilBarrels = function() {
        console.log('shouldAskOilBarrels()')
        let oilBarrels = false;

        currentNAICS.forEach(function(code) {
            console.log(getNAICS(code).id);
            if (getNAICS(code).id === '324110') {
                console.log('You should ask for Oil Barrels!!')
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

    let searchPage = function(naics) {
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

        // let specialHeading;
        // let specialName;
        // let specialText;

        // switch (type) {
        //     case '324110':
        //         specialHeading = '324110'
        //         specialName = 'Petroleum Refineries'
        //         specialText = 'To qualify as small for purposes of Government procurement, the petroleum refiner, including its affiliates, must be a concern that has either no more than 1,500 employees or no more than 200,000 barrels per calendar day total Operable Atmospheric Crude Oil Distillation capacity.  Capacity includes all domestic and foreign affiliates, all owned or leased facilities, and all facilities under a processing agreement or an arrangement such as an exchange agreement or a throughput.  To qualify under the capacity size standard, the firm, together with its affiliates, must be primarily engaged in refining crude petroleum into refined petroleum products.  A firm’s “primary industry” is determined in accordance with 13 CFR § 121.107.'
        //         break;
        //     case '541519':
        //         specialHeading = '541519'
        //         specialName = 'Information Technology Value Added Resellers'
        //         specialText = 'An Information Technology Value Added Reseller (ITVAR) provides a total solution to information technology acquisitions by providing multi-vendor hardware and software along with significant value added services.  Significant value added services consist of, but are not limited to, configuration consulting and design, systems integration, installation of multi-vendor computer equipment, customization of hardware or software, training, product technical support, maintenance, and end user support.  For purposes of Government procurement, an information technology procurement classified under this exception and 150-employee size standard must consist of at least 15% and not more than 50% of value added services, as measured by the total contract price.  In addition, the offeror must comply with the manufacturing performance requirements, or comply with the non-manufacturer rule by supplying the products of small business concerns, unless SBA has issued a class or contract specific waiver of the non-manufacturer rule.  If the contract consists of less than 15% of value added services, then it must be classified under a NAICS manufacturing industry.  If the contract consists of more than 50% of value added services, then it must be classified under the NAICS industry that best describes the predominate service of the procurement.'
        //         break;
        //     case '562910':
        //         specialHeading = '562910'
        //         specialName = 'Environmental Remediation Services'
        //         specialText = `For SBA assistance as a small business concern in the industry of Environmental Remediation Services, other than for Government procurement, a concern must be engaged primarily in furnishing a range of services for the remediation of a contaminated environment to an acceptable condition including, but not limited to, preliminary assessment, site inspection, testing, remedial investigation, feasibility studies, regulatory compliance, remedial design, containment, remedial action, removal of contaminated materials, nuclear remediation, storage of contaminated materials and security and site closeouts.  If one of such activities accounts for 50 percent or more of a concern's total revenues, employees, or other related factors, the concern's primary industry is that of the particular industry and not the Environmental Remediation Services Industry.`
        //         break;
        //     default:
        //         specialText = 'Your business is classified in a special NAICS code, but we do not recognize this special case.'
        // }
    }


    let resultPage = function(renderedResult) {

        // if (small) {
        //     renderedResult = `<div class="flex">
        //                         <span>${currentNAICS.id} <br> ${currentNAICS.description} </span>
        //                         <span>Small Business Size Standards <br> ${calculateLimit()}</span>
        //                         <span>YES</span>
        //                       </div>
        //                       <p id="success text">You may be eligible to participate in an SBA contracting program.</p>`
        // } else {
        //     renderedResult = `<div class="flex">
        //                         <span>${currentNAICS.id} <br> ${currentNAICS.description} </span>
        //                         <span>Small Business Size Standards <br> ${calculateLimit()}</span>
        //                         <span>NO</span>
        //                       </div>
        //                       <p id="failure text">Your business is too large to meet the current small size standards.</p>`
        // }

        return `<div class="width70">
                    <h2>Are you a small business eligible for government contracting?</h2>
                    <div class="flex" id="results">

                    </div>
                    <br>
                    ${renderedResult}
                    <div class="flex">
                        <div class="border">
                            <p>Learn more about SBA small business size standards.</p>
                            <h3>SBA Office of Size Standards</h3>
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
                            <h3>SBA Office of Contracting</h3>
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
                    <form action="javascript:navigate('search');">
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
        console.log(currentNAICS);
        return currentNAICS;
    }

    let flash = function(msg) {
        let flashElement = document.querySelector('#flash');

        if (flashElement) {
            flashElement.textContent = msg;
            flashElement.classList.remove('hidden');
            return true;
        } else {
            return false;
        }
    }

    public.setCompanySize = function(type) {
        let inputElement = document.querySelector('.input-number');
        console.debug(inputElement);

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
                console.log(sizeResult);

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
            console.debug(NAICS);
        }

        // URL Detector
        // let params = getParams();
        // console.debug(`URL detected.  Query String(s) for stage: ${params.step} , for naics: ${params.naics} , with employeeLimit: ${params.employeeLimit} , with revenueLimit: ${params.revenueLimit}`);

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