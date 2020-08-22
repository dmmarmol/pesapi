const _ = require('lodash');

const DEBUG = true;
const BASE_URL = "http://pesdb.net/pes2018/";
const MAX_PAGES = 1;
const MAX_PLAYERS_PER_PAGE = 1;
const THROTTLE = 1000 * _.random(2, 4); // seconds
const OUTPUT_PATH = './output';
/** @deprecated 0.0.5 */
const CONCURRENCY = 1;

module.exports = { BASE_URL, DEBUG, MAX_PAGES, MAX_PLAYERS_PER_PAGE, CONCURRENCY, THROTTLE, OUTPUT_PATH };
