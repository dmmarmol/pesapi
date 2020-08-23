import { random } from "./tools/utils";

const DEBUG = true;
const GAME_VERSION = "pes2020";
const BASE_URL = `http://pesdb.net/${GAME_VERSION}`;
const THROTTLE = 1000 * random(2, 4); // seconds
const OUTPUT_PATH = "./output";

module.exports = {
  BASE_URL,
  DEBUG,
  THROTTLE,
  OUTPUT_PATH,
};
