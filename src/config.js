const _ = require('lodash');

const DEBUG = true;
const MAX_PAGES = 3;
const CONCURRENCY = 1;
const BASE_URL = "http://pesdb.net/pes2018/";
const THROTTLE = 1000 * _.random(2, 4); // seconds

module.exports = { BASE_URL, DEBUG, MAX_PAGES, CONCURRENCY, THROTTLE };
