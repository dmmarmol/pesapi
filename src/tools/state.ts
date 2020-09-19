const { logger, logSeparator } = require("./logger");

interface Player {
  id: number;
}

interface State {
  totalPages: number;
  playerIdsByPage: { [i: string]: Player };
  players: Player[];
  totalPlayers: number;
  lastPlayerId: number;
  currentPage: number;
  currentPlayerId: number;
}
type SetState = typeof setState;

let state = {
  totalPages: 1,
  playerIdsByPage: {},
  players: [],
  totalPlayers: 0,
  lastPlayerId: 0,
  currentPage: 1,
  currentPlayerId: 0,
};

logSeparator();
logger.info("Initial State");
logger.info(state);

function setState(
  value: { [i in keyof typeof state]?: typeof state[i] }
): State {
  const nextState = {
    ...state,
    ...value,
  };
  state = nextState;
  logSeparator();
  logger.info("State Updated!");
  return state;
}

export const useState = (): [State, SetState] => [state, setState];
