let charter = (function() {

    // Variables

    // Charts (HTML DOM elements)
    let primeBarChart;
    let primeLineChart;
    let subBarChart;
    let subLineChart;
    let comparisonBarChart;

    // Charts (JavaScript objects)
    let primeChartBar;
    let primeChartLine;
    let subChartBar;
    let subChartLine;
    let comparisonChartBar;

    let public = {};

    public.destroyCharts = function() {
        if (primeChartBar) {
            primeChartBar.destroy();
        }

        if (primeChartLine) {
            primeChartLine.destroy();
        }

        if (subChartBar) {
            subChartBar.destroy();
        }

        if (subChartLine) {
            subChartLine.destroy();
        }

        if (comparisonChartBar) {
            comparisonChartBar.destroy();
        }
    }

    public.hydrateCharts = function(chartData) {
        // Prime Charts
        // https://stackoverflow.com/questions/28180871/grouped-bar-charts-in-chart-js

        // Compose data to be used in Prime Bar Chart for CFY Goals and Achievement
        const labelsBar = ["Small Business", "Women Owned", "Disadvantaged", "Service Disabled Veteran Owned", "HUBZone"];

        const primeBarChartGoals = [
            chartData.prime_sb_cfy_goal,
            chartData.prime_wosb_cfy_goal,
            chartData.prime_sdb_cfy_goal,
            chartData.prime_sdvosb_cfy_goal,
            chartData.prime_hz_cfy_goal
        ].map((goal) => parseFloat(goal));

        const primeBarChartAchievements = [
            chartData.prime_sb_cfy_achievement,
            chartData.prime_wosb_cfy_achievement,
            chartData.prime_sdb_cfy_achievement,
            chartData.prime_sdvosb_cfy_achievement,
            chartData.prime_hz_cfy_achievement
        ].map((achievement) => parseFloat(achievement));

        // Define chart from data with format and colors and labels 
        const primeDataBar = {
            labels: labelsBar,
            datasets: [{
                label: 'Goal',
                backgroundColor: 'rgba(147, 0, 0, 0.2)',
                borderColor: 'rgba(147, 0, 0, 1)',
                data: primeBarChartGoals,
                borderWidth: 1
            }, {
                label: 'Achievement',
                backgroundColor: 'rgba(0, 81, 139, 0.2)',
                borderColor: 'rgba(0, 81, 139, 1)',
                data: primeBarChartAchievements,
                borderWidth: 1
            }]
        };

        // Configure chart with options, e.g. positioning, title text, legend
        const primeConfigBar = {
            type: 'bar',
            data: primeDataBar,
            options: {
                plugins: {
                    title: {
                        display: true,
                        fullSize: false,
                        position: 'top',
                        text: `${chartData.fiscal_year} Goals and Achievement`,
                    },
                    legend: {
                        display: true,
                        position: 'right'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            },
        };

        // Instantiate the actual chart and hydrate it into the DOM
        primeChartBar = new Chart(
            primeBarChart,
            primeConfigBar
        );

        // Compose data to be used in Prime Line Chart for Past 5 Years of Achievement
        const lineLabelsLine = [
            chartData.fiscal_year - 4,
            chartData.fiscal_year - 3,
            chartData.fiscal_year - 2,
            chartData.fiscal_year - 1,
            chartData.fiscal_year
        ];

        // Small Business
        const primeLineChartAchievementsSB = [
            chartData.prime_sb_pfy4_achievement,
            chartData.prime_sb_pfy3_achievement,
            chartData.prime_sb_pfy2_achievement,
            chartData.prime_sb_pfy_achievement,
            chartData.prime_sb_cfy_achievement
        ].map((achievement) => parseFloat(achievement));

        // Women Owned Small Business
        const primeLineChartAchievementsWOSB = [
            chartData.prime_wosb_pfy4_achievement,
            chartData.prime_wosb_pfy3_achievement,
            chartData.prime_wosb_pfy2_achievement,
            chartData.prime_wosb_pfy_achievement,
            chartData.prime_wosb_cfy_achievement
        ].map((achievement) => parseFloat(achievement));

        // Disadvantaged
        const primeLineChartAchievementsSDB = [
            chartData.prime_sdb_pfy4_achievement,
            chartData.prime_sdb_pfy3_achievement,
            chartData.prime_sdb_pfy2_achievement,
            chartData.prime_sdb_pfy_achievement,
            chartData.prime_sdb_cfy_achievement
        ].map((achievement) => parseFloat(achievement));

        // Service Disabled Veteran Owned
        const primeLineChartAchievementsSDVOSB = [
            chartData.prime_sdvosb_pfy4_achievement,
            chartData.prime_sdvosb_pfy3_achievement,
            chartData.prime_sdvosb_pfy2_achievement,
            chartData.prime_sdvosb_pfy_achievement,
            chartData.prime_sdvosb_cfy_achievement
        ].map((achievement) => parseFloat(achievement));

        // HUBZone
        const primeLineChartAchievementsHZ = [
            chartData.prime_hz_pfy4_achievement,
            chartData.prime_hz_pfy3_achievement,
            chartData.prime_hz_pfy2_achievement,
            chartData.prime_hz_pfy_achievement,
            chartData.prime_hz_cfy_achievement
        ].map((achievement) => parseFloat(achievement));

        // Define chart from data with format and colors and labels 
        const primeDataLine = {
            labels: lineLabelsLine,
            datasets: [{
                label: 'Small Business',
                data: primeLineChartAchievementsSB,
                fill: false,
                borderColor: 'rgb(147, 0, 0)',
                tension: 0.1
            }, {
                label: 'Women Owned',
                data: primeLineChartAchievementsWOSB,
                fill: false,
                borderColor: 'rgba(0, 81, 139, 1)',
                tension: 0.1
            }, {
                label: 'Disadvantaged',
                data: primeLineChartAchievementsSDB,
                fill: false,
                borderColor: 'rgba(88, 172, 239, 1)',
                tension: 0.1
            }, {
                label: 'Service Disabled Veteran Owned',
                data: primeLineChartAchievementsSDVOSB,
                fill: false,
                borderColor: 'rgba(25, 126, 78, 1)',
                tension: 0.1
            }, {
                label: 'HUBZone',
                data: primeLineChartAchievementsHZ,
                fill: false,
                borderColor: 'rgba(241, 196, 0, 1)',
                tension: 0.1
            }]
        };

        // Configure chart with options, e.g. positioning, title text, legend
        const primeConfigLine = {
            type: 'line',
            data: primeDataLine,
            options: {
                plugins: {
                    title: {
                        display: true,
                        fullSize: false,
                        position: 'top',
                        text: 'Prime Contracting Achievement Trend',
                    },
                    legend: {
                        display: true,
                        position: 'right',
                        maxWidth: 235
                    }
                },
            }
        };

        // Instantiate the actual chart and hydrate it into the DOM
        primeChartLine = new Chart(
            primeLineChart,
            primeConfigLine
        );

        // Subcontracting Charts

        // Compose data to be used in Subcontracting Bar Chart for CFY Goals and Achievement
        const subBarChartGoals = [
            chartData.sub_sb_cfy_goal,
            chartData.sub_wosb_cfy_goal,
            chartData.sub_sdb_cfy_goal,
            chartData.sub_sdvosb_cfy_goal,
            chartData.sub_hz_cfy_goal
        ].map((goal) => parseFloat(goal));

        const subBarChartAchievements = [
            chartData.sub_sb_cfy_achievement,
            chartData.sub_wosb_cfy_achievement,
            chartData.sub_sdb_cfy_achievement,
            chartData.sub_sdvosb_cfy_achievement,
            chartData.sub_hz_cfy_achievement
        ].map((achievement) => parseFloat(achievement));

        const subDataBar = {
            labels: labelsBar,
            datasets: [{
                label: 'Goal',
                backgroundColor: 'rgba(147, 0, 0, 0.2)',
                borderColor: 'rgba(147, 0, 0, 1)',
                data: subBarChartGoals,
                borderWidth: 1
            }, {
                label: 'Achievement',
                backgroundColor: 'rgba(0, 81, 139, 0.2)',
                borderColor: 'rgba(0, 81, 139, 1)',
                data: subBarChartAchievements,
                borderWidth: 1
            }]
        }

        const subConfigBar = {
            type: 'bar',
            data: subDataBar,
            options: {
                plugins: {
                    title: {
                        display: true,
                        fullSize: false,
                        position: 'top',
                        text: `${chartData.fiscal_year} Goals and Achievement`,
                    },
                    legend: {
                        display: true,
                        position: 'right'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            },
        };

        // Instantiate the actual chart and hydrate it into the DOM
        subChartBar = new Chart(
            subBarChart,
            subConfigBar
        );

        // Compose data to be used in Sub Line Chart for Past 5 Years of Achievement
        // Small Business
        const subLineChartAchievementsSB = [
            chartData.sub_sb_pfy4_achievement,
            chartData.sub_sb_pfy3_achievement,
            chartData.sub_sb_pfy2_achievement,
            chartData.sub_sb_pfy_achievement,
            chartData.sub_sb_cfy_achievement
        ].map((achievement) => parseFloat(achievement));

        // Women Owned Small Business
        const subLineChartAchievementsWOSB = [
            chartData.sub_wosb_pfy4_achievement,
            chartData.sub_wosb_pfy3_achievement,
            chartData.sub_wosb_pfy2_achievement,
            chartData.sub_wosb_pfy_achievement,
            chartData.sub_wosb_cfy_achievement
        ].map((achievement) => parseFloat(achievement));

        // Disadvantaged
        const subLineChartAchievementsSDB = [
            chartData.sub_sdb_pfy4_achievement,
            chartData.sub_sdb_pfy3_achievement,
            chartData.sub_sdb_pfy2_achievement,
            chartData.sub_sdb_pfy_achievement,
            chartData.sub_sdb_cfy_achievement
        ].map((achievement) => parseFloat(achievement));

        // Service Disabled Veteran Owned
        const subLineChartAchievementsSDVOSB = [
            chartData.sub_sdvosb_pfy4_achievement,
            chartData.sub_sdvosb_pfy3_achievement,
            chartData.sub_sdvosb_pfy2_achievement,
            chartData.sub_sdvosb_pfy_achievement,
            chartData.sub_sdvosb_cfy_achievement
        ].map((achievement) => parseFloat(achievement));

        // HUBZone
        const subLineChartAchievementsHZ = [
            chartData.sub_hz_pfy4_achievement,
            chartData.sub_hz_pfy3_achievement,
            chartData.sub_hz_pfy2_achievement,
            chartData.sub_hz_pfy_achievement,
            chartData.sub_hz_cfy_achievement
        ].map((achievement) => parseFloat(achievement));

        const subDataLine = {
            labels: lineLabelsLine,
            datasets: [{
                label: 'Small Business',
                data: subLineChartAchievementsSB,
                fill: false,
                borderColor: 'rgb(147, 0, 0)',
                tension: 0.1
            }, {
                label: 'Women Owned',
                data: subLineChartAchievementsWOSB,
                fill: false,
                borderColor: 'rgba(0, 81, 139, 1)',
                tension: 0.1
            }, {
                label: 'Disadvantaged',
                data: subLineChartAchievementsSDB,
                fill: false,
                borderColor: 'rgba(88, 172, 239, 1)',
                tension: 0.1
            }, {
                label: 'Service Disabled Veteran Owned',
                data: subLineChartAchievementsSDVOSB,
                fill: false,
                borderColor: 'rgba(25, 126, 78, 1)',
                tension: 0.1
            }, {
                label: 'HUBZone',
                data: subLineChartAchievementsHZ,
                fill: false,
                borderColor: 'rgba(241, 196, 0, 1)',
                tension: 0.1
            }]
        };

        // Configure chart with options, e.g. positioning, title text, legend
        const subConfigLine = {
            type: 'line',
            data: subDataLine,
            options: {
                plugins: {
                    title: {
                        display: true,
                        fullSize: false,
                        position: 'top',
                        text: 'Subcontracting Achievement Trend',
                    },
                    legend: {
                        display: true,
                        position: 'right',
                        maxWidth: 235
                    }
                },
            }
        };

        // Instantiate the actual chart and hydrate it into the DOM
        subChartLine = new Chart(
            subLineChart,
            subConfigLine
        );

        // Comparison Bar Chart

        // Compose data to be used in Small Business Comparison chart
        // Previous Fiscal Year Count

        const comparisonPFYCount = [
            chartData.category_sb_pfy_vendor_count,
            chartData.category_wosb_pfy_vendor_count,
            chartData.category_sdb_pfy_vendor_count,
            chartData.category_sdvosb_pfy_vendor_count,
            chartData.category_hz_pfy_vendor_count
        ].map((comparison) => parseFloat(comparison.replace(/,/g, '')));

        // Current Fiscal Year Count
        const comparisonCFYCount = [
            chartData.category_sb_cfy_vendor_count,
            chartData.category_wosb_cfy_vendor_count,
            chartData.category_sdb_cfy_vendor_count,
            chartData.category_sdvosb_cfy_vendor_count,
            chartData.category_hz_cfy_vendor_count
        ].map((comparison) => parseFloat(comparison.replace(/,/g, '')));

        const comparisonDataBar = {
            labels: labelsBar,
            datasets: [{
                label: `${chartData.fiscal_year_previous} Count`,
                // When data model is updated to include previous fiscal year, use this:
                // label: `${chartData.fiscal_year_previous} Count`,
                backgroundColor: 'rgba(147, 0, 0, 0.2)',
                borderColor: 'rgba(147, 0, 0, 1)',
                data: comparisonPFYCount,
                borderWidth: 1
            }, {
                label: `${chartData.fiscal_year} Count`,
                backgroundColor: 'rgba(0, 81, 139, 0.2)',
                borderColor: 'rgba(0, 81, 139, 1)',
                data: comparisonCFYCount,
                borderWidth: 1
            }]
        };

        // Configure chart with options, e.g. positioning, title text, legend
        const comparisonConfigBar = {
            type: 'bar',
            data: comparisonDataBar,
            options: {
                plugins: {
                    title: {
                        display: true,
                        fullSize: false,
                        position: 'top',
                        text: 'Number of Small Business Comparison',
                    },
                    legend: {
                        display: true,
                        position: 'right'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            },

        };

        // Instantiate the actual chart and hydrate it into the DOM
        comparisonChartBar = new Chart(
            comparisonBarChart,
            comparisonConfigBar
        );

        return chartData;
    }

    public.init = function(pBC, pLC, sBC, sLC, cBC) {
        console.log("Charter initialized!");
        // Gather DOM Canvas elements
        primeBarChart = pBC;
        primeLineChart = pLC;
        subBarChart = sBC;
        subLineChart = sLC;
        comparisonBarChart = cBC;
    }

    return public;
})();