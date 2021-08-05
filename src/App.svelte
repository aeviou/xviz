<script lang="ts">
  import State from "./State.svelte";
  import { useMachine } from "@xstate/svelte";
  import { XMachine } from "./machines/XMachine.js";
  let stateName = "";
  let name = "world";

  const { state, send } = useMachine(XMachine, { devTools: true });
</script>

<div>
  <div>
    <input
      bind:value={stateName}
      type="text"
      maxlength="140"
      autocomplete="off"
    />
    <br />
    <button
      on:click={() => {
        // let ancestry;
        // stateAncestry.assign(ancestry);
        // ancestry.push();

        const addStateEvent = {
          type: "ADD_STATE",
          payload: {
            parentID: "",
            stateName: stateName,
          },
        };

        send(addStateEvent);
        stateName = "";
      }}
    >
      Add State
    </button>
  </div>
  {#if $state.context.machine.states.length !== 0}
    <p>There are {$state.context.machine.states.length} states</p>
  {/if}
  {#each $state.context.machine.states as stateObj}
    <State
      parentState={$state.context.machine}
      currentState={stateObj}
      {state}
      {send}
    />
  {/each}
</div>
<br />

<button
  on:click={() => {
    send({
      type: "EXPORT_MACHINE",
    });
  }}
>
  Export State
</button>

<p>{$state.context.code}</p>

<style>
</style>
