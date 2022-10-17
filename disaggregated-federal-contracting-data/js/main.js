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
          organizeDataSummary(data.data);
        }
      })
    }).catch(err => {
      // err is the raw response
      console.log(`Failed to fetch data`, err.status, err.statusText, err.url);
      // return err;
    })

  const organizeDataSummary = (dataSummary) => {
    const dataSummaryAscendingPercentOrder = dataSummary.sort((a, b) => a.percent - b.percent);
    const races = dataSummaryAscendingPercentOrder.map(data => data.race);
    const businessOwnedPercents = dataSummaryAscendingPercentOrder.map(data => data.percent);

    drawChart(races, businessOwnedPercents);
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


})();