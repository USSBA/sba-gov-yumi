function buttonAction (event) {
  event.target.nextSibling.style.display === 'none'
    ? event.target.nextSibling.style.display = ''
    : event.target.nextSibling.style.display = 'none';
}

(() => {
  const fetchData = async year => {
   const url = `https://sba-gov-yumi.s3.amazonaws.com/disaggregated-federal-contracting-data/data/fy${year}_data_aggregation.json`
   //const url = `data/fy${year}_data_aggregation.json`

   const response = await fetch(url)

    if (response.ok) {
        return await response.json();
    } else {
        return Promise.reject(response);
    }
  }

  // this number needs to be updated.
  fetchData('2022')
    .then(res => {
      res.forEach(data => {
        if (data.title.startsWith('Data Summary')) {
          organizeDataSummary(data);
        }
          createIndividualRaceTable(data);
      })
    }).catch(err => {
      // err is the raw response
      console.log(`Failed to fetch data`, err.status, err.statusText, err.url);
      // return err;
    });

  const organizeDataSummary = (dataSummary) => {
    const races = dataSummary.data.map(data => data.race);
    
    const businessOwnedPercents = dataSummary.data.map(data => {
      const numberWithoutPercentSign = data.percent.slice(0, -1);
      const percentInDecimal = Number(numberWithoutPercentSign);

      return percentInDecimal;
    });

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
      options: {
        plugins: {
          legend: {
            position: 'bottom',
            align: 'left',
            labels: {
              textAlign:'left'
            }
          }
        }
      }
    };

    const pie =  document.getElementById('pie-chart');
    pie.setAttribute('alt', 'Pie chart showing FY 2022 federal contracting by race and business size (see data summary below for details).');
  
    // window.addEventListener('beforeprint', () => {
    //   pieChart.resize(600, 600);
    // });
    window.addEventListener('afterprint', () => {
      pieChart.resize();
    });
    
    const pieChart = new Chart(
      document.getElementById('pie-chart'),
      configPie
    );
  }

  const createDataSummaryTable = (dataSummary) => {
    const parentDiv = document.body.getElementsByClassName('table-container')[0];
    const childContainerDiv = document.createElement('section');
    const tableDetails = document.createElement('details');
    const tableTitle = document.createElement('summary');

    childContainerDiv.setAttribute('class', 'data-summary-table-container');
    parentDiv.appendChild(childContainerDiv);

    tableTitle.innerText = dataSummary.title;
    childContainerDiv.appendChild(tableDetails);
    tableDetails.appendChild(tableTitle);

    const tbl = document.createElement('table');
    tbl.setAttribute('class', 'data-summary-table u-full-width');

    const tableHeaderTitles = Object.keys(dataSummary.data[0]);

    createTable(tbl, dataSummary.data);
    createTableHeader(tbl, tableHeaderTitles);

    tableDetails.appendChild(tbl);
  }

  const createIndividualRaceTable = (data) => {
    const parentDiv = document.body.getElementsByClassName('table-container')[0];

    if (data.title.startsWith('Top 5 Departments by Race')) {
      data.data.forEach(tableData => {
        const race = Object.keys(tableData)[0];
        const tableSection = document.createElement('section');
        tableSection.setAttribute('class', `${race}-section`);

        const tableDetails = document.createElement('details');
        const tabletitle = document.createElement('summary');
        tabletitle.innerText = normalize(race);

        const tableDiv = document.createElement('div')
        tableDiv.setAttribute('class', `${race}-tables race-div`);

        tableDetails.appendChild(tabletitle);
        tableSection.appendChild(tableDetails);
        parentDiv.appendChild(tableSection);

        const tbl = document.createElement('table');
        tbl.setAttribute('class', `${race}-departments-table u-full-width`);

        const tableTitle = document.createElement('h4');
        const title = data.title.slice(0, data.title.indexOf('by'))
        tableTitle.innerHTML = title;

        const tableHeaderTitles = Object.keys(tableData[race][0]);

        createTable(tbl, tableData[race]);
        createTableHeader(tbl, tableHeaderTitles);

        tableDiv.appendChild(tableTitle);
        tableDiv.appendChild(tbl);

        tableDetails.appendChild(tableDiv);
      });
    }

    if (data.title.startsWith('Top 5 NAICS Codes by Race')) {
      data.data.forEach(tableData => {
        const race = Object.keys(tableData)[0];
        const tableDiv = document.getElementsByClassName(`${race}-tables`)[0];
        
        const tbl = document.createElement('table');
        tbl.setAttribute('class', `${race}-naics-table u-full-width`);

        const tableHeaderTitles = Object.keys(tableData[race][0]);

        createTable(tbl, tableData[race]);
        createTableHeader(tbl, tableHeaderTitles);

        const tableTitle = document.createElement('h4');
        const title = data.title.slice(0, data.title.indexOf('by'))
        tableTitle.innerHTML = title;

        tableDiv.appendChild(tableTitle);
        tableDiv.appendChild(tbl);
      });
    }
  }

  const createTableHeader = (table, data) => {
    const thead = table.createTHead();
    const row = thead.insertRow();

    for (const key of data) {
      const firstLetterCapitalizedTitle = normalize(key);
      const th = document.createElement("th");
      th.setAttribute("scope", "col");
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