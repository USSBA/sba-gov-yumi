var naics = (function() {

    // Variables

    let containerElement;
    let autocompleteElement;
    let numberinputElement;

    let currentNAICS;
    let NAICS;
    let naicsURL = 'https://www.sba.gov/naics'

    let public = {};

    // Methods

    // Utility function to delete null values from an object
    function deleteNullValues(obj) {
        for (const key in obj) {
            if (obj[key] === null) {
                delete obj[key];
            }
        }

        return obj;
    }

    // Data handling

    let fetchNAICS = function() {
        return fetch(naicsURL).then(function(response) {
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
            console.info(`fetchNAICS() succcess`);
            NAICS = data;
            return data;
        }).catch(function(err) {
            // err is the raw response
            console.warn(`fetchNAICS() failed`, err.status, err.statusText, err.url);

            return err;
        })
    };

    let codes = function() {
        return NAICS.map((code) => code.id + " " + code.description);
    }

    let calculateType = function(code) {

        if (code.employeeCountLimit) {
            return 'employee';
        }

        if (code.revenueLimit) {
            return 'revenue';
        }

        return 'unknown';

    }

    let calculateLimit = function() {
        if (currentNAICS.employeeCountLimit) {
            return currentNAICS.employeeCountLimit;
        }

        if (currentNAICS.revenueLimit) {
            return currentNAICS.revenueLimit * 1000000;
        }

    }

    let calculateSize = function(code, size) {

        size = parseInt(size);

        if (code.employeeCountLimit) {
            if (code.employeeCountLimit >= size) {
                console.log(`EmployeeCountLimit ${code.employeeCountLimit} is greater than ${size}`);
                return true;
            } else {
                console.log('nope!')
            }
        }

        if (code.revenueLimit) {
            let realDollarLimit = code.revenueLimit * 1000000;
            console.log(realDollarLimit);
            if (realDollarLimit >= size) {
                console.log(`realDollarLimit ${realDollarLimit} is greater than ${size}`);
                return true;
            }
        }

        return false;
    }

    let search = function(naics) {

        if (typeof(naics) === 'string') {
            if (naics.length > 6) {
                // Trim first 6 characters
                naics = naics.substring(0, 6);
            }
        } else {
            console.debug(`loader.search(${naics}) not a String`)
        }

        return NAICS.find(code => code.id === naics);

    };

    // Rendering

    let landingPage = function() {
        // Code goes here...
        return `<h2 id="heading">Size Standards Tool</h2>
                <form action="javascript:navigate('search');">
                    <img src="img/size-standards-ruler-business.png" alt="Illustration of a business being measured by rulers." />
                    <p class="question">Do you qualify as a small business for government contracting purposes?</p>
                    <submit class="button">Start</submit>
                </form>`;
    };

    let searchPage = function() {
        return `<div class="width70">
                    <h2>What's your industry?</h2>
                    <p>Select your 6-digit NAICS code</p>
                    <form action="javascript:navigate('size');">

                        <input class="awesomplete" id="search-input" placeholder="Search by NAICS code or keyword" />

                        <p>The North American Industry Classification System (NAICS) classifies businesses according to type of economic activity.</p>
                        <p>If you don't know which NAICS code to select, visit census.gov for a comprehensive search and listing.</p>
                        <input class="button" type="submit" value="search" />
                    </form>
                </div>`;
    }

    let sizePage = function(type) {

        if (type === 'employee') {
            return `<div class="width70">
                        <form action="javascript:navigate('result');">
                            <h2>How many employees?</h2>
                            <br>
                            <label>Number of employees<br><input class="input-number" type="number"></label>
                            <p>
                                This should be the average number of full-time or part-time employees over the last 12 months.
                            </p>
                            <input class="button" type="submit" value="Check Size" />
                        </form>
                    </div>`;
        }

        if (type === 'revenue') {
            return `<div class="width70">
                        <form action="javascript:navigate('result');">
                        <h2>How much average annual receipts or revenue?</h2>
                        <br>
                        <label>Five-year Average<br><input class="input-number" type="number"></label>
                        <p>
                            Your average annual receipts/revenue is generally calculated as your total receipts/revenue or total income plus cost of goods sold (including all affiliates, if any) over the latest completed five (5) fiscal years divided by five (5). See 13 CFR 121.104
                            for details.
                        </p>
                        <input class="button" type="submit" value="Check Size" />
                        </form>
                    </div>`;
        }

        if (type === 'special') {
            return `<div class="width70">
                        <h2>NAICS Code: <span id="special-naics"></span></h2>
                        <p id="special-naics-name"></p>
                        <p id="special-instructions"></p>
                        <br>
                        <form action="javascript:navigate('landing');>
                            <input class="button" type="submit" value="Start Over" />
                        </form>
                    </div>`;
        }

        return false;
    }

    var resultPage = function(small) {

        console.log(small);

        let renderedResult;

        if (small) {
            renderedResult = `<div class="flex">
                                <span>${currentNAICS.id} <br> ${currentNAICS.description} </span>
                                <span>Small Business Size Standards <br> ${calculateLimit()}</span>
                                <span>YES</span>
                              </div>
                              <p id="success text">You may be eligible to participate in an SBA contracting program.</p>`
        } else {
            renderedResult = `<div class="flex">
                                <span>${currentNAICS.id} <br> ${currentNAICS.description} </span>
                                <span>Small Business Size Standards <br> ${calculateLimit()}</span>
                                <span>NO</span>
                              </div>
                              <p id="failure text">Your business is too large to meet the current small size standard.</p>`
        }

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

    // Master render function

    public.render = function(page) {
        switch (page) {
            case 'landing':
                containerElement.innerHTML = landingPage();
                break;
            case 'search':
                containerElement.innerHTML = searchPage();
                autocompleteElement = document.querySelector("#search-input");
                console.log(autocompleteElement);
                new Awesomplete(autocompleteElement, {
                    list: codes()
                });
                break;
            case 'size':
                console.log(autocompleteElement.value);
                // let searchResult = search(autocompleteElement.value.toString());

                let searchResult = search(autocompleteElement.value);
                currentNAICS = searchResult;
                console.log(currentNAICS);

                window.history.pushState(null, '', `index3.html?naics=${currentNAICS.id}`);

                let sizeType = calculateType(currentNAICS);
                console.log(sizeType);

                containerElement.innerHTML = sizePage(sizeType);
                break;
            case 'result':
                numberinputElement = document.querySelector(".input-number");
                console.log(numberinputElement.value);

                let sizeResult = calculateSize(currentNAICS, numberinputElement.value);
                console.log(sizeResult);

                containerElement.innerHTML = resultPage(sizeResult);
                break;
            default:
                console.log(`Sorry, no type / limit detected for ${page}.`);
        }
    };

    public.init = function(ele) {

        containerElement = ele;
        console.log('Renderer initialized and attached to:');
        console.log(containerElement);

        NAICS = fetchNAICS();
        console.log(`
                                    Loader initialized and retrieved.
                                    `);

        return NAICS;
    };

    // Return the Public APIs

    return public;

})();