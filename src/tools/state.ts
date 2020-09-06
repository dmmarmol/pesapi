const { logger, logSeparator } = require("./logger");

let state = {
  totalPages: 1,
  playerIds: [],
  players: [],
  totalPlayers: 0,
  lastPlayerId: 0,
  currentPage: 1,
  currentPlayerId: 0,
};

type State = typeof state;
type SetState = typeof setState;

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
  console.log(state);
  return state;
}

export const useState = (): [State, SetState] => [state, setState];
