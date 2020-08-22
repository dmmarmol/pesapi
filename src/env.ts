import { random } from "./utils";

const DEBUG = true;
const BASE_URL = "http://pesdb.net/pes2020";
const THROTTLE = 1000 * random(2, 4); // seconds
const OUTPUT_PATH = "./output";

module.exports = {
  BASE_URL,
  DEBUG,
  THROTTLE,
  OUTPUT_PATH,
};
