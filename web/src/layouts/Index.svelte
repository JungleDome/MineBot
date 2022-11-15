<script>
  import { Router, Route } from "svelte-routing";

  // components for this layout
  import IndexNavbar from "../components/Navbars/IndexNavbar.svelte";
  import Sidebar from "../components/Sidebar/Sidebar.svelte";
  import HeaderStats from "../components/Headers/HeaderStats.svelte";
  import Footer from "../components/Footers/Footer.svelte";

  // pages for this layout
  import Dashboard from "../views/Dashboard.svelte";
  import Settings from "../views/Settings.svelte";
  import BotList from "../views/BotList.svelte";
  import BotActiveList from "../views/BotActiveList.svelte";
  import Chat from "../views/Chat.svelte";
  import Console from "../views/Console.svelte";
  import { initTimer } from "../components/store";

  export let location;
  export let admin = "";

  initTimer();
</script>

<div>
  <Sidebar {location} />
  <div class="relative md:ml-64 bg-blueGray-100">
    <IndexNavbar />
    <HeaderStats />
    <div class="px-4 md:px-10 mx-auto w-full -m-24">
      <Router>
        <Route path="/" component={Dashboard} />
        <Route path="create" component={Settings} />
        <Route path="create/:id" let:params>
          <Settings id={params.id} />
        </Route>
        <Route path="activeList" component={BotActiveList} />
        <Route path="list" component={BotList} />
        <Route path="chat/:id" let:params>
          <Chat id={params.id} />
        </Route>
        <Route path="console/:id" let:params>
          <Console id={params.id} />
        </Route>
      </Router>
      <Footer />
    </div>
  </div>
</div>
