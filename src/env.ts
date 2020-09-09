import { random } from "./tools/utils";

const DEBUG = true;
const GAME_VERSION = "pes2020";
const BASE_URL = `http://pesdb.net/${GAME_VERSION}`;
const REQUEST_TIMEOUT_MINUTES = 3.5;
const OUTPUT_PATH = "./output";

module.exports = {
  BASE_URL,
  DEBUG,
  REQUEST_TIMEOUT_MINUTES,
  OUTPUT_PATH,
};
