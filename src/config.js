const _ = require('lodash');

const DEBUG = true;
const BASE_URL = "http://pesdb.net/pes2018/";
const MAX_PAGES = 5;
const MAX_PLAYERS_PER_PAGE = 32;
const THROTTLE = (DEBUG ? _.random(2, 4) : _.random(5, 10)) * 1000; // seconds
const OUTPUT_PATH = './output';

module.exports = { BASE_URL, DEBUG, MAX_PAGES, MAX_PLAYERS_PER_PAGE, THROTTLE, OUTPUT_PATH };
