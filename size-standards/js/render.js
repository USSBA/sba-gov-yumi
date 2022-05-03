var render = (function() {

    // Variables
    let public = {};
    let containerElement;

    // Methods

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

    var resultPage = function() {
        return `<div class="width70">
                    <h2>Are you a small business eligible for government contracting?</h2>
                    <div class="flex" id="results">

                    </div>
                    <br>
                    <p id="success text">You may be eligible to participate in an SBA contracting program.</p>
                    <div class="flex">
                        <div>
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
                        <div>
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
                        <form action="javascript:navigate('search');">
                            <input class="button" type="submit" value="Start Over" />
                        </form>
                    </div>
                </div>`;
    }

    public.render = function(page) {
        switch (page) {
            case 'landing':
                containerElement.innerHTML = landingPage();
                break;
            case 'search':
                containerElement.innerHTML = searchPage();
                break;
            case 'size':
                containerElement.innerHTML = sizePage('employee');
                break;
            case 'result':
                containerElement.innerHTML = resultPage();
                break;
            default:
                console.log(`Sorry, no type/limit detected for ${limit}.`);
        }
    };

    public.init = function(ele) {
        containerElement = ele;
        console.log('Renderer initialized and attached to:');
        console.log(containerElement);
    };


    //
    // Return the Public APIs
    //

    return public;

})();