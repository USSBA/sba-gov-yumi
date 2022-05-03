const revenueSection = document.querySelector("#revenue");
const employeeSection = document.querySelector("#employee");
const specialSection = document.querySelector("#special");
const specialHeading = document.querySelector("#special-naics");
const specialName = document.querySelector("#special-naics-name");
const specialText = document.querySelector("#special-instructions");

/*!
 * Get the URL parameters
 * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {String} url The URL
 * @return {Object}     The URL parameters
 */
let getParams = function(url = window.location) {
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

let { NAICS, limit } = getParams();

switch (limit) {
    case 'revenue':
        revenueSection.classList.remove('hidden');
        break;
    case 'employee':
        employeeSection.classList.remove('hidden');
        break;
    case 'special':
        specialSection.classList.remove('hidden');
        switch (NAICS) {
            case '324110':
                specialHeading.textContent = '324110'
                specialName.textContent = 'Petroleum Refineries'
                specialText.textContent = 'To qualify as small for purposes of Government procurement, the petroleum refiner, including its affiliates, must be a concern that has either no more than 1,500 employees or no more than 200,000 barrels per calendar day total Operable Atmospheric Crude Oil Distillation capacity.  Capacity includes all domestic and foreign affiliates, all owned or leased facilities, and all facilities under a processing agreement or an arrangement such as an exchange agreement or a throughput.  To qualify under the capacity size standard, the firm, together with its affiliates, must be primarily engaged in refining crude petroleum into refined petroleum products.  A firm’s “primary industry” is determined in accordance with 13 CFR § 121.107.'
                break;
            case '541519':
                specialHeading.textContent = '541519'
                specialName.textContent = 'Information Technology Value Added Resellers'
                specialText.textContent = 'An Information Technology Value Added Reseller (ITVAR) provides a total solution to information technology acquisitions by providing multi-vendor hardware and software along with significant value added services.  Significant value added services consist of, but are not limited to, configuration consulting and design, systems integration, installation of multi-vendor computer equipment, customization of hardware or software, training, product technical support, maintenance, and end user support.  For purposes of Government procurement, an information technology procurement classified under this exception and 150-employee size standard must consist of at least 15% and not more than 50% of value added services, as measured by the total contract price.  In addition, the offeror must comply with the manufacturing performance requirements, or comply with the non-manufacturer rule by supplying the products of small business concerns, unless SBA has issued a class or contract specific waiver of the non-manufacturer rule.  If the contract consists of less than 15% of value added services, then it must be classified under a NAICS manufacturing industry.  If the contract consists of more than 50% of value added services, then it must be classified under the NAICS industry that best describes the predominate service of the procurement.'
                break;
            case '562910':
                specialHeading.textContent = '562910'
                specialName.textContent = 'Environmental Remediation Services'
                specialText.textContent = `For SBA assistance as a small business concern in the industry of Environmental Remediation Services, other than for Government procurement, a concern must be engaged primarily in furnishing a range of services for the remediation of a contaminated environment to an acceptable condition including, but not limited to, preliminary assessment, site inspection, testing, remedial investigation, feasibility studies, regulatory compliance, remedial design, containment, remedial action, removal of contaminated materials, nuclear remediation, storage of contaminated materials and security and site closeouts.  If one of such activities accounts for 50 percent or more of a concern's total revenues, employees, or other related factors, the concern's primary industry is that of the particular industry and not the Environmental Remediation Services Industry.`
                break;
            default:
                specialText.textContent = 'Your business is classified in a special NAICS code.'

        }
        break;
    default:
        console.log(`Sorry, no type/limit detected for ${limit}.`);
}