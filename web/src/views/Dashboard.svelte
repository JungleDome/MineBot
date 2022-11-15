<script>
  // core components
  import CardLineChart from "../components/Cards/CardLineChart.svelte";
  import CardBotTotalOnlineChart from "../components/Cards/CardBotTotalOnlineChart.svelte";
  import CardBotServerTotalOnlineChart from "../components/Cards/CardBotServerTotalOnlineChart.svelte";
  import CardBotRecentOnlineChart from "../components/Cards/CardBotRecentOnlineChart.svelte";
  import CardPageVisits from "../components/Cards/CardPageVisits.svelte";
  import CardSocialTraffic from "../components/Cards/CardSocialTraffic.svelte";
  import CardBotDashboardTable from "../components/Cards/CardBotDashboardTable.svelte";
  export let location;

  import { sendRequest } from "../components/store";
  import { onDestroy } from "svelte";
  import { success, error, warn } from "../components/toast.js";

  let recentBotOnlineTime;
  let totalBotOnlineTime;
  let totalMinecraftServerOnlineTime;

  function getDashboardStats() {
    sendRequest("dashboard")
      .then((x) => {
        recentBotOnlineTime = x.recentBotOnlineTime;
        totalBotOnlineTime = x.totalBotOnlineTime;
        totalMinecraftServerOnlineTime = x.totalMinecraftServerOnlineTime;
      })
      .catch((err) => {
        error(err);
      });
  }

  getDashboardStats();
</script>

<div>
  <div class="flex flex-wrap">
    <div class="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
      <CardBotRecentOnlineChart {recentBotOnlineTime} />
    </div>
    <div class="w-full xl:w-4/12 px-4">
      <CardBotTotalOnlineChart {totalBotOnlineTime} />
    </div>
  </div>
  <div class="flex flex-wrap mt-4">
    <div class="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
      <CardBotDashboardTable />
    </div>
    <div class="w-full xl:w-4/12 px-4">
      <CardBotServerTotalOnlineChart {totalMinecraftServerOnlineTime} />
    </div>
  </div>
</div>
