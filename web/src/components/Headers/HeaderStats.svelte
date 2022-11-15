<script>
  // core components
  import CardStats from "../../components/Cards/CardStats.svelte";

  //custom logic
  import { sendRequest, botList, secondsToDDHHMMSS } from "../store";
  import { onDestroy } from "svelte";

  let uptime = "N/A";
  let memoryUsed = 0 ;
  let totalBotCount = 0;
  let endedBotCount = 0;

  // const unsubscribe = botList.subscribe((value) => {
  //   activeBotCount = value.filter(x => x.status == "Normal").length;
  // });
  // onDestroy(unsubscribe);

  function getStats() {
    sendRequest("stats").then((data) => {
      uptime = data.uptime;
      memoryUsed = data.memoryUsed
      totalBotCount = data.botCount
      endedBotCount = data.endedBotCount
    });
  }

  setInterval(getStats, 1000);
</script>

<!-- Header -->
<div class="relative bg-red-500 md:pt-32 pb-32 pt-12">
  <div class="px-4 md:px-10 mx-auto w-full">
    <div>
      <!-- Card stats -->
      <div class="flex flex-wrap">
        <div class="w-full lg:w-6/12 xl:w-3/12 px-4">
          <CardStats
            statSubtitle="UPTIME"
            statTitle={`${secondsToDDHHMMSS(Math.floor(uptime / 1000))}`}
            statHasLastChanged={false}
            statArrow="up"
            statPercent="3.48"
            statPercentColor="text-emerald-500"
            statDescription="Since last month"
            statIconName="far fa-chart-bar"
            statIconColor="bg-red-500"
          />
        </div>
        <div class="w-full lg:w-6/12 xl:w-3/12 px-4">
          <CardStats
            statSubtitle="MEMORY USED"
            statTitle={`${memoryUsed.toFixed(2) ?? 'N/A'} MB`}
            statHasLastChanged={false}
            statArrow="down"
            statPercent="3.48"
            statPercentColor="text-red-500"
            statDescription="Since last week"
            statIconName="fas fa-chart-pie"
            statIconColor="bg-orange-500"
          />
        </div>
        <div class="w-full lg:w-6/12 xl:w-3/12 px-4">
          <CardStats
            statSubtitle="ONLINE BOTS"
            statTitle={totalBotCount}
            statHasLastChanged={false}
            statArrow="down"
            statPercent="1.10"
            statPercentColor="text-orange-500"
            statDescription="Since yesterday"
            statIconName="fas fa-users"
            statIconColor="bg-pink-500"
          />
        </div>
        <div class="w-full lg:w-6/12 xl:w-3/12 px-4">
          <CardStats
            statSubtitle="INACTIVE BOTS"
            statTitle={endedBotCount}
            statHasLastChanged={false}
            statArrow="up"
            statPercent="12"
            statPercentColor="text-emerald-500"
            statDescription="Since last month"
            statIconName="fas fa-percent"
            statIconColor="bg-emerald-500"
          />
        </div>
      </div>
    </div>
  </div>
</div>
