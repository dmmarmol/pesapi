const { getAmountOfPages, getTotalPlayers } = require("./services/page");
const { logger, logSeparator } = require("./tools/logger");

let state = {
  pages: 1,
  players: [],
  totalPlayers: 0,
};

type State = typeof state;
type SetState = State;

logSeparator();
logger.info("Initial State");
logger.info(state);
function setState(value: { [i in keyof typeof state]?: any }): State {
  const nextState = {
    ...state,
    ...value,
  };
  state = nextState;
  logSeparator();
  logger.info("New State");
  logger.info(state);
  return state;
}

async function init() {
  const pages = await getAmountOfPages();
  const totalPlayers = await getTotalPlayers();
  setState({
    pages,
    totalPlayers,
  });
}

init();
