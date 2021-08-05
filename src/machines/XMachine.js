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

  deleteTransition(event) {
    // for (var i = 0; i < this.on.length; i++) {
    //   // if (this.on[i].eventName === eventName) {
    //   //   this.on.splice(i, 1);
    //   // }
    // }
    for (let each of this.on) {
      if (each.event === event) {
        const index = this.on.indexOf(each);
        this.on.splice(index, 1);
        return;
      }
    } // If it goes through, it means that we don't handle an event with that name in this state.
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
    this.code = "";
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

  getStateString(currentState) {
    let stateString = "";
    if (currentState.on && currentState.on.length > 0) {
      console.log("on!");
      let allOn = "";
      for (let each of currentState.on) {
        let target = each.event + ": '" + each.target + "',";
        allOn += target;
      }
      let resultantOn = "on: {" + allOn + "},";
      stateString += resultantOn;
    }
    if (currentState.states.length > 0) {
      for (let innerState of currentState.states) {
        stateString += this.getStateString(innerState);
      }
    }
    if (currentState.states.length > 1) {
      stateString = "states:{" + stateString + "},";
    }
    if (currentState.initial && !currentState.context) {
      //Don't do this for the parent obj
      stateString = "initial: '" + currentState.initial + "'," + stateString;
    }
    if (!currentState.context) {
      //If it has context it means that it's the parent machine
      //And therefor it won't have an id
      stateString = currentState.id + ":{" + stateString + "},";
    }
    return stateString;
  }

  exportMachine() {
    let stateString = this.getStateString(this);

    let output = "const fetchMachine = Machine({ id: 'mach',";
    if (this.initial) {
      output += "initial: '" + this.initial + "',";
    }
    output += "context:{},";
    if (this.states.length > 0) {
      output += "states:{" + stateString + "}";
    } else {
      output += stateString;
    }
    output += "});"; //Can be any project name
    //output still needs initial
    this.code = output;
    return this.code;
  }
}

export const XMachine = createMachine(
  {
    id: "xmach",
    initial: "main",
    context: {
      machine: new Machine(),
      code: "",
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
          DELETE_TRANSITION: {
            actions: "deleteTransition",
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

      deleteTransition: assign({
        machine: (context, event) => {
          console.log(event.payload);
          let currentState = context.machine.findState(event.payload.stateName);
          currentState.deleteTransition(event.payload.eventName);
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
        code: (context, event) => {
          context.code = context.machine.exportMachine();
          console.log(context.code);
          return context.code;
        },
      }),
    },
  }
);
