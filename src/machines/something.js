const fetchMachine = Machine({
  id: "mach",
  initial: "main",
  context: {},
  states: { main: { states: { load: {}, start: {} } } },
});
