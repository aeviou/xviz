import { createMachine, assign } from "xstate";
import { getEventType } from "xstate/lib/utils";
import _ from "lodash";

class State {
  constructor(id) {
    this.id = id; //string
    this.on = [];
    // this.initial = ""; // ref to another State's id
    this.states = []; // class State
  }

  addTransition(eventName, targetState) {
    for (let each of this.on) {
      if (each.eventName === eventName) {
        alert(
          "Sorry, we already have a listener for that event in this state!"
        );
      }
    } // If it goes through, it means that we don't handle an event with that name in this state.

    this.on.push({ event: eventName, target: targetState });
  }

  addState(newState) {
    if (this.states.length === 0) {
      this.initial = newState.id;
    }
    this.states.push(newState);
  }

  updateID(id) {
    this.id = id;
  }

  updateInitial(initial) {
    this.initial = initial;
  }
}

class Machine {
  constructor() {
    this.context = {};
    // this.initial = "";
    this.states = [];
    this.flat_states = {};
    this.events = [];
  }

  findState(id) {
    let stateBFS = [];
    for (let each of this.states) {
      console.log(each);
      stateBFS.push(each);
    }
    while (stateBFS.length !== 0) {
      let currentState = stateBFS[0];
      console.log(currentState.id);
      if (currentState.id === id) {
        return currentState;
      } else {
        for (let each of currentState.states) {
          stateBFS.push(each);
        }
        stateBFS.shift();
      }
    }
    return null;
  }

  exportMachine() {
    let output = "";
    output += "id: mach,"; //Can be any project name
  }
}

export const XMachine = createMachine(
  {
    id: "xmach",
    initial: "main",
    context: {
      machine: new Machine(),
      machineCode: "",
    },
    states: {
      main: {
        on: {
          ADD_TRANSITION: {
            actions: "addTransition",
          },
          ADD_EVENT: {
            actions: "addEvent",
          },
          ADD_STATE: {
            actions: "addState",
          },
          EXPORT_MACHINE: {
            actions: "exportMachine",
          },
        },
      },
    },
  },
  {
    actions: {
      addEvent: assign({
        machine: (context, event) => {
          context.machine.events.push(event.payload.eventName);
          return context.machine;
        },
      }),

      addTransition: assign({
        machine: (context, event) => {
          console.log(event.payload);
          let currentState = context.machine.findState(event.payload.stateName);
          currentState.addTransition(
            event.payload.eventName,
            event.payload.targetState
          );
          return context.machine;
        },
      }),
      addState: assign({
        machine: (context, event) => {
          //I'm going to need to pass in the hierarchy of the object as the payload
          if (
            event.payload.stateName === "" ||
            !event.payload.stateName.trim()
          ) {
            alert("Sorry, no empty state names!");
            return context.machine;
          }
          if (event.payload.stateName in context.machine.flat_states) {
            alert("Sorry, no duplicate state names!");
            return context.machine;
          }
          let newStateObj = new State(event.payload.stateName);

          context.machine.flat_states[event.payload.stateName] = newStateObj;
          if (event.payload.parentID === "") {
            context.machine.states.push(newStateObj);
            context.machine.initial = newStateObj.id;
          } else {
            let parentState = context.machine.findState(event.payload.parentID);
            parentState.addState(newStateObj);
          }
          return context.machine;
        },
      }),
      exportMachine: assign({
        machineCode: (context, event) => {
          context.machineCode = context.machine.exportCode();
          console.log(context.machineCode);
          return context.machineCode;
        },
      }),
    },
  }
);
