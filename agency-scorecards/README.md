# Processing Data
New data should only be accepted in the agreed upon .XLSX format.

## Steps for Ingestion
1. Open .XLSX and select Save As > .CSV UTF-8 delimited
2. Quality check the .CSV to make sure no spaces appear in the column headers
3. Navigate to [CSV-to-JSON](https://www.convertcsv.com/csv-to-json.htm) website
4. Upload file
5. Save as .JSON

This should product an array of JSON with individual objects, each one representing an agency.

# Development and Setup
There's nothing to install, no scripts to run, or dependencies to verify.  It's all vanilla JavaScript on top of regular old HTML and CSS.  The only dependency is [Chart.js](https://www.chartjs.org/), which we have downloaded manually and committed to this repository.