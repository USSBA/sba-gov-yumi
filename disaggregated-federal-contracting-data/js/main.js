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

  fetchData('2021')
    .then(res => {
      res.forEach(data => {
        if (data.title.startsWith('Data Summary')) {
          organizeDataSummary(data.title, data.data);

        }
      })
    }).catch(err => {
      // err is the raw response
      console.log(`Failed to fetch data`, err.status, err.statusText, err.url);
      // return err;
    })

  const organizeDataSummary = (dataTitle, dataSummary) => {
    const dataSummaryAscendingPercentOrder = dataSummary.sort((a, b) => a.percent - b.percent);
    const races = dataSummaryAscendingPercentOrder.map(data => data.race);
    const businessOwnedPercents = dataSummaryAscendingPercentOrder.map(data => data.percent * 100);

    drawChart(races, businessOwnedPercents);
    createDataSummaryTable(dataTitle, dataSummaryAscendingPercentOrder);
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

  const createDataSummaryTable = (dataTitle, dataSummary) => {
    const parentDiv = document.body.getElementsByClassName('container')[0];
    const childDiv = document.createElement('div');
    const tableTitleATag = document.createElement('a');

    childDiv.setAttribute('class', 'data-summary-table-container');
    parentDiv.appendChild(childDiv);

    tableTitleATag.setAttribute('href', 'javascript:void(0)');
    tableTitleATag.innerText = dataTitle
    childDiv.appendChild(tableTitleATag);

    const tbl = document.createElement('table');
    tbl.setAttribute('id', 'data-summary');
    tbl.setAttribute('class', 'u-full-width');

    const data = Object.keys(dataSummary[0]);

    createTableHeader(tbl, data);
    createTable(tbl, dataSummary);

    childDiv.appendChild(tbl);
  }

  const createTableHeader = (table, data) => {
    const thead = table.createTHead();
    const row = thead.insertRow();

    for (const key of data) {
      const firstLetterCapitalizedTitle = key.charAt(0).toUpperCase() + key.slice(1);

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
})();