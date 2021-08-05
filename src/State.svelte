<script>
  export let state;
  export let send;
  export let currentState;
  export let parentState;
  import Modal, { getModal } from "./Modal.svelte";
  import Transition from "./Transition.svelte";

  let selectedEvent;
  let selectedTargetState;
  let stateName = "";
  let eventName = "";
  let modalID = currentState.id + "2";
</script>

<div>
  <p>State: {currentState.id}</p>

  <input
    bind:value={stateName}
    type="text"
    maxlength="140"
    autocomplete="off"
  />
  <br />
  <button
    on:click={() => {
      send({
        type: "ADD_STATE",
        payload: {
          parentID: currentState.id,
          stateName: stateName,
        },
      });
      stateName = "";
    }}
  >
    Add State
  </button>

  <!-- <button on:click={() => {}}>Add Transition</button>
  <select id="levelStates">
    {#each parentState.states as stateObj, i}
      <option value={i}>{stateObj.id}</option>
    {/each}
  </select> -->

  {#if currentState.states.length !== 0}
    <p>There are {currentState.states.length} states</p>
  {/if}

  {#each currentState.states as stateObj}
    <svelte:self
      parentState={currentState}
      currentState={stateObj}
      {state}
      {send}
    />
  {/each}

  <button
    on:click={() => {
      console.log(currentState.id);
      getModal(currentState.id).open();
    }}
  >
    Add Transition
  </button>

  {#each currentState.on as transition}
    <Transition {currentState} {transition} {state} {send} />
  {/each}

  <!-- the modal without an `id` -->
  <Modal id={currentState.id}>
    <h1>Transition to which state?</h1>
    <!-- opening a model with an `id` and specifying a callback	 -->

    <p>On Event:</p>

    {#if $state.context.machine.events.length !== 0}
      <select bind:value={selectedEvent} id="levelStates">
        {#each $state.context.machine.events as event, i}
          <option value={i}>{event}</option>
        {/each}
      </select>
    {:else}
      <p>No Events</p>
    {/if}

    <button
      on:click={() => {
        getModal(modalID).open();
      }}
    >
      Add New Event
    </button>
    <br />
    <p>Target State:</p>
    <select bind:value={selectedTargetState} id="levelStates">
      {#each parentState.states as stateObj, i}
        <option value={i}>{stateObj.id}</option>
      {/each}
    </select>
    <hr />
    <button
      on:click={() => {
        if ($state.context.machine.events[selectedEvent]) {
          send({
            type: "ADD_TRANSITION",
            payload: {
              stateName: currentState.id,
              targetState: parentState.states[selectedTargetState].id,
              eventName: $state.context.machine.events[selectedEvent],
            },
          });

          getModal(currentState.id).close();
        } else {
          alert("There's no selected event!");
        }
      }}
    >
      Add Transition
    </button>
    <!-- On click this button should add the new state transition based on the event -->
  </Modal>

  <Modal id={modalID}>
    <h1>Add New Event?</h1>

    <!-- Passing a value back to the callback function	 -->
    <input
      bind:value={eventName}
      type="text"
      maxlength="140"
      autocomplete="off"
    />
    <br />
    <button
      class="green"
      on:click={() => {
        if (eventName.trim() === "") {
          alert("Events must have a name!");
        } else {
          send({
            type: "ADD_EVENT",
            payload: {
              eventName: eventName,
            },
          });
          getModal(modalID).close();
        }
      }}
    >
      Add Event
    </button>
  </Modal>
</div>

<style>
  div {
    /* this will only affect <p> elements in this component */
    color: burlywood;
    outline: 2px dashed blue;
    /* float: left; */
    padding-left: 20px;
  }

  hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid #ccc;
    margin: 1em 0;
    padding: 0;
  }
</style>
