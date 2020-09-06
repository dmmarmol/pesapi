const { getAmountOfPages, getTotalPlayers } = require("./services/page");
const { useState } = require("./tools/state");
const { getAllPlayerIds } = require("./services/players");

async function prepareBaseState() {
  const [state, setState] = useState();
  const totalPages = await getAmountOfPages();
  const totalPlayers = await getTotalPlayers();
  setState({
    totalPages,
    totalPlayers,
  });
}

/**
 * Start
 */
async function init() {
  const [state, setState] = useState();
  await prepareBaseState();
  const playerIds = await getAllPlayerIds();
  setState({ playerIds });
}

init();
