(() => {
  const fetchData = async year => {
    const url = `https://sba-gov-yumi.s3.amazonaws.com/disaggregated-federal-contracting-data/data/fy${year}_data_aggregation.json`
    const response = await fetch(url)

    if (response.ok) {
        return await response.json();
    } else {
        return Promise.reject(response);
    }
  }

  // this number needs to be updated.
  fetchData('2021')
    .then(res => {
      res.forEach(data => {
        if (data.title.startsWith('Data Summary')) {
          organizeDataSummary(data);
        }
          createIndividualRaceTable(data)
      })
    }).catch(err => {
      // err is the raw response
      console.log(`Failed to fetch data`, err.status, err.statusText, err.url);
      // return err;
    })

  const organizeDataSummary = (dataSummary) => {
    // const dataSummaryAscendingPercentOrder = dataSummary.data.sort((a, b) => a.percent - b.percent);
    const races = dataSummary.data.map(data => data.race);
    const businessOwnedPercents = dataSummary.data.map(data => data.percent * 100);

    drawChart(races, businessOwnedPercents);
    createDataSummaryTable({title: dataSummary.title, data: dataSummary.data});
  }

  const drawChart = (races, businessOwnedPercents) => {
    const dataPie = {
      labels: [...races],
      datasets: [{
          label: 'Data Summary for Federal Contracting',
          data: [...businessOwnedPercents],
          // https://colors.artyclick.com/color-shades-finder/
          backgroundColor: [
              'rgb(6, 232, 70)',
              'rgb(219, 150, 98)',
              'rgb(239, 11, 91)',
              'rgb(204, 26, 183)',
              'rgb(8, 168, 104)',
              'rgb(206, 178, 18)',
              'rgb(21, 80, 132)',
              'rgb(143, 25, 45)',
          ],
          hoverOffset: 4
      }]
    };
    
    const configPie = {
      type: 'pie',
      data: dataPie,
    };
    
    const pieChart = new Chart(
      document.getElementById('pie-chart'),
      configPie
    );
  }

  const createDataSummaryTable = (dataSummary) => {
    const parentDiv = document.body.getElementsByClassName('container')[0];
    const childDiv = document.createElement('div');
    const tableTitleATag = document.createElement('a');

    childDiv.setAttribute('class', 'data-summary-table-container');
    parentDiv.appendChild(childDiv);

    tableTitleATag.setAttribute('href', 'javascript:void(0)');
    tableTitleATag.innerText = dataSummary.title;
    childDiv.appendChild(tableTitleATag);

    const tbl = document.createElement('table');
    tbl.setAttribute('class', 'data-summary-table u-full-width');

    const tableHeaderTitles = Object.keys(dataSummary.data[0]);

    createTableHeader(tbl, tableHeaderTitles);
    createTable(tbl, dataSummary.data);

    childDiv.appendChild(tbl);
  }

  const createIndividualRaceTable = (data) => {
    const parentDiv = document.body.getElementsByClassName('container')[0];

    if (data.title.startsWith('Top 5 Departments by Race')) {
      data.data.forEach(tableData => {
        const race = Object.keys(tableData)[0];
        const tableTitleATag = document.createElement('a');
        const childDiv = document.createElement('div');

        childDiv.setAttribute('class', `${race}-tables-container`);
        tableTitleATag.setAttribute('href', 'javascript:void(0)');
        tableTitleATag.innerText = normalize(race);

        childDiv.appendChild(tableTitleATag);
        parentDiv.appendChild(childDiv);

        const tbl = document.createElement('table');
        tbl.setAttribute('class', `${race}-departments-table u-full-width`);

        const tableHeaderTitles = Object.keys(tableData[race][0]);

        createTableHeader(tbl, tableHeaderTitles);
        createTable(tbl, tableData[race]);

        childDiv.appendChild(tbl);
      });
    }

    if (data.title.startsWith('Top 5 NAICS Codes by Race')) {
      data.data.forEach(tableData => {
        const race = Object.keys(tableData)[0];
        const raceTablesContainer = document.getElementsByClassName(`${race}-tables-container`)[0];
        
        const tbl = document.createElement('table');
        tbl.setAttribute('class', `${race}-naics-table u-full-width`);

        createTable(tbl, tableData[race]);

        raceTablesContainer.appendChild(tbl);
      });
    }
  }

  const createTableHeader = (table, data) => {
    const thead = table.createTHead();
    const row = thead.insertRow();

    for (const key of data) {
      const firstLetterCapitalizedTitle = normalize(key);
      const th = document.createElement("th");
      const text = document.createTextNode(firstLetterCapitalizedTitle);
      
      th.appendChild(text);
      row.appendChild(th);
    }
  }

  const createTable = (table, data) => {
    for (let element of data) {
      const row = table.insertRow();
      for (key in element) {
        const cell = row.insertCell();
        const text = document.createTextNode(element[key]);

        cell.appendChild(text);
      }
    }
  }

  function normalize(str) {
    const words = str.split('_');
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(' ');
  }
})();