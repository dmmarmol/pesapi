const _ = require('lodash');

const DEBUG = true;
const MAX_PAGES = 1;
const MAX_PLAYERS_PER_PAGE = 1;
const CONCURRENCY = 1;
const BASE_URL = "http://pesdb.net/pes2018/";
const THROTTLE = 1000 * _.random(2, 4); // seconds

module.exports = { BASE_URL, DEBUG, MAX_PAGES, MAX_PLAYERS_PER_PAGE, CONCURRENCY, THROTTLE };
