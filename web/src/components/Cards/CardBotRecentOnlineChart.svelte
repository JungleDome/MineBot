<script>
  import { afterUpdate } from "svelte";
  import Chart from "chart.js";
  import { randomColor, transformMsToMin } from "../store";

  export let recentBotOnlineTime = [];

  afterUpdate(() => {
    renderChart();
  });

  function generateDatasets() {
    let botsOnline = {};
    for (let dailyOnline of recentBotOnlineTime) {
      for (let botOnline of dailyOnline.botsOnlineTime) {
        if (botsOnline[botOnline.username]) botsOnline[botOnline.username].push(transformMsToMin(botOnline.onlineTime));
        else botsOnline[botOnline.username] = [transformMsToMin(botOnline.onlineTime)];
      }
    }

    let datasets = [];
    for (let bot in botsOnline) {
      datasets.push({
        label: bot,
        backgroundColor: `#${randomColor()}`,
        borderColor: `#${randomColor()}`,
        data: botsOnline[bot],
        fill: false,
      });
    }

    return datasets;
  }

  // init chart
  async function renderChart() {
    var config = {
      type: "line",
      data: {
        labels: recentBotOnlineTime.map((x) => new Date(x.date).toDateString()),
        datasets: generateDatasets(),
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        title: {
          display: false,
          text: "Recent Bot Online Duration Charts",
          fontColor: "white",
        },
        legend: {
          labels: {
            fontColor: "white",
          },
          align: "end",
          position: "bottom",
        },
        tooltips: {
          mode: "index",
          intersect: false,
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
        scales: {
          xAxes: [
            {
              ticks: {
                fontColor: "rgba(255,255,255,.7)",
              },
              display: true,
              scaleLabel: {
                display: false,
                labelString: "Date",
                fontColor: "white",
              },
              gridLines: {
                display: false,
                borderDash: [2],
                borderDashOffset: [2],
                color: "rgba(33, 37, 41, 0.3)",
                zeroLineColor: "rgba(0, 0, 0, 0)",
                zeroLineBorderDash: [2],
                zeroLineBorderDashOffset: [2],
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                fontColor: "rgba(255,255,255,.7)",
              },
              display: true,
              scaleLabel: {
                display: true,
                labelString: "Duration (Min)",
                fontColor: "white",
              },
              gridLines: {
                borderDash: [3],
                borderDashOffset: [3],
                drawBorder: false,
                color: "rgba(255, 255, 255, 0.15)",
                zeroLineColor: "rgba(33, 37, 41, 0)",
                zeroLineBorderDash: [2],
                zeroLineBorderDashOffset: [2],
              },
            },
          ],
        },
      },
    };
    var ctx = document.getElementById("line-chart").getContext("2d");
    window.myLine = new Chart(ctx, config);
  }
</script>

<div class="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-blueGray-700">
  <div class="rounded-t mb-0 px-4 py-3 bg-transparent">
    <div class="flex flex-wrap items-center">
      <div class="relative w-full max-w-full flex-grow flex-1">
        <h6 class="uppercase text-blueGray-100 mb-1 text-xs font-semibold">Overview</h6>
        <h2 class="text-white text-xl font-semibold">Recent bot online duration</h2>
      </div>
    </div>
  </div>
  <div class="p-4 flex-auto">
    <!-- Chart -->
    <div class="relative h-350-px">
      <canvas id="line-chart" />
    </div>
  </div>
</div>
