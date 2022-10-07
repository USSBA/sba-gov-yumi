const dataPie = {
  labels: [
      'Asian-Pacific American Owned Small',
      'Subcontinent Asian American Owned Small',
      'Black Owned Small',
      'Hispanic Owned Small',
      'Native American Owned Small',
      'Other Minority Owned Small',
      'Other Small Business',
      'Not a Small Business'
  ],
  datasets: [{
      label: 'My First Dataset',
      data: [1.23, 1.55, 1.67, 1.78, 2.69, 0.48, 15.64, 74.96],
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