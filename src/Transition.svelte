<script>
  export let state;
  export let send;
  export let currentState;
  export let transition;
</script>

<div>
  <div>
    <p>EVENT: {transition.event}</p>
    <p>TARGET: {transition.target}</p>

    <br />
    <button
      on:click={() => {
        // let ancestry;
        // stateAncestry.assign(ancestry);
        // ancestry.push();

        const deleteTransition = {
          type: "DELETE_TRANSITION",
          payload: {
            stateName: currentState.id,
            eventName: transition.event,
          },
        };

        send(deleteTransition);
      }}
    >
      DELETE TRANSITION
    </button>
  </div>
  {#if $state.context.machine.states.length !== 0}
    <p>There are {$state.context.machine.states.length} states</p>
  {/if}
</div>

<style>
</style>
