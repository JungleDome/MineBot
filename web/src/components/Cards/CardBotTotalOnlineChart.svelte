<script>
  import { afterUpdate } from "svelte";
  import Chart from "chart.js";
  import { randomColor, transformMsToMin } from "../store";

  export let totalBotOnlineTime = [];


  afterUpdate(() => {
    renderChart()
    console.log(generateDatasets())
  })

  function generateDatasets() {
    let datasets = [];
    for (let bot of totalBotOnlineTime) {
      datasets.push({
        label: bot.username,
        backgroundColor: `#${randomColor()}`,
        borderColor: `#${randomColor()}`,
        data: [transformMsToMin(bot.onlineTime)],
        fill: false,
        barThickness: 8
      });
    }

    return datasets;
  }


  async function renderChart() {
    let config = {
      type: "bar",
      data: {
        labels: [],
        datasets: generateDatasets(),
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        title: {
          display: false,
          text: "Online Time",
        },
        tooltips: {
          mode: "index",
          intersect: false,
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
        legend: {
          labels: {
            fontColor: "rgba(0,0,0,.4)",
          },
          align: "end",
          position: "bottom",
        },
        scales: {
          xAxes: [
            {
              display: false,
              scaleLabel: {
                display: true,
                labelString: "Bot",
              },
              gridLines: {
                borderDash: [2],
                borderDashOffset: [2],
                color: "rgba(33, 37, 41, 0.3)",
                zeroLineColor: "rgba(33, 37, 41, 0.3)",
                zeroLineBorderDash: [2],
                zeroLineBorderDashOffset: [2],
              },
            },
          ],
          yAxes: [
            {
              display: true,
              scaleLabel: {
                display: false,
                labelString: "Value",
              },
              gridLines: {
                borderDash: [2],
                drawBorder: false,
                borderDashOffset: [2],
                color: "rgba(33, 37, 41, 0.2)",
                zeroLineColor: "rgba(33, 37, 41, 0.15)",
                zeroLineBorderDash: [2],
                zeroLineBorderDashOffset: [2],
              },
            },
          ],
        },
      },
    };
    let ctx = document.getElementById("bar-chart").getContext("2d");
    window.myBar = new Chart(ctx, config);
  }
</script>

<div class="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
  <div class="rounded-t mb-0 px-4 py-3 bg-transparent">
    <div class="flex flex-wrap items-center">
      <div class="relative w-full max-w-full flex-grow flex-1">
        <h6 class="uppercase text-blueGray-400 mb-1 text-xs font-semibold">Performance</h6>
        <h2 class="text-blueGray-700 text-xl font-semibold">Total online time</h2>
      </div>
    </div>
  </div>
  <div class="p-4 flex-auto">
    <div class="relative h-350-px">
      <canvas id="bar-chart" />
    </div>
  </div>
</div>
