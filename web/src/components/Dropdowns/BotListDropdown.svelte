<script>
  // library for creating dropdown menu appear on click
  import { createPopper } from "@popperjs/core";

  // core components
  import { link } from "svelte-routing";
  import { sendRequest } from "../store";
  import { success, error, warn } from "../toast.js";

  export let id;
  export let botStartedHandler = () => {};
  export let hideStartButton = false;

  let dropdownPopoverShow = false;

  let btnDropdownRef;
  let popoverDropdownRef;
  let startBotLoading = false;

  const toggleDropdown = (event) => {
    event.preventDefault();
    if (dropdownPopoverShow) {
      dropdownPopoverShow = false;
    } else {
      dropdownPopoverShow = true;
      createPopper(btnDropdownRef, popoverDropdownRef, {
        placement: "bottom-start",
      });
    }
  };

  function startBot() {
    if (!id) return;

    startBotLoading = true;
    sendRequest("startBot", "POST", { loginInfoId: id })
      .then((x) => {
        startBotLoading = false;
        botStartedHandler();
      })
      .catch((err) => {
        startBotLoading = false;
        console.log(err);
        error(err);
      });
  }

  function deleteBot() {
    if (!id) return;

    sendRequest("deleteBot", "POST", { loginInfoId: id })
      .then((x) => {
        window.location.reload();
      })
      .catch((err) => {
        error(err);
      });
  }
</script>

<div>
  <a class="text-blueGray-500 py-1 px-3" href="#pablo" bind:this={btnDropdownRef} on:click={toggleDropdown}>
    <i class="fas fa-ellipsis-v" />
  </a>
  <div bind:this={popoverDropdownRef} class="bg-white text-base z-50 float-left py-2 list-none text-left rounded shadow-lg min-w-48 {dropdownPopoverShow ? 'block' : 'hidden'}">
    {#if !hideStartButton}
      <a
        href="#"
        class="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700 hover:bg-orange-100 hover:shadow ease-linear transition-all duration-150"
        on:click={startBot}
      >
        Start
        <i class="fas fa-circle-notch text-orange-600 animate-spin h-auto w-auto float-right {startBotLoading ? '' : 'invisible '}" />
      </a>
    {/if}
    <a
      href="/create/{id}"
      use:link
      class="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700 hover:bg-orange-100 hover:shadow ease-linear transition-all duration-150"
    >
      Edit
    </a>
    <div class="h-0 my-2 border border-solid border-t-0 border-blueGray-800 opacity-50" />
    <a
      href="#"
      class="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-red-100 text-blueGray-700 hover:bg-red-200 hover:shadow ease-linear transition-all duration-150"
      on:click={deleteBot}
    >
      Delete
    </a>
  </div>
</div>
