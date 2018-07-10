const _ = require('lodash');
const chalk = require('chalk');
const config = require('./config');
const path = require('path');
const fs = require('fs');

const MONTH_CODES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


const getPageUrl = (pageNumber) => {
    const index = pageNumber <= 0 || !pageNumber ? 1 : pageNumber;
    const url = index !== 1 ? `${config.BASE_URL}?page=${pageNumber}` : config.BASE_URL;
    return url;
};
const getPlayerUrl = (playerId) => {
    return `${config.BASE_URL}?id=${playerId}`
}

/**
 * Logea en colores
 */
const divider = () => console.log("______")
const log = {
    white: (value, ...args) => {
        divider();
        console.log(`${chalk.black.bgWhite(value)}:`, chalk.black.bgWhite(...args))
    },
    red: (value, ...args) => {
        divider();
        console.log(chalk.whiteBright.bgRed(`${value}:`), chalk.whiteBright.bgRed(...args))
    },
    green: (value, ...args) => {
        divider();
        console.log(chalk.whiteBright.bgGreen(`${value}:`), chalk.whiteBright.bgGreen(...args))
    },
    blue: (value, ...args) => {
        divider();
        console.log(chalk.whiteBright.bgBlue(`${value}:`), chalk.whiteBright.bgBlue(...args))
    },
    path: (value, ...args) => {
        divider();
        console.log(chalk.whiteBright.bgMagenta(`${value}:`), chalk.whiteBright.bgMagenta(...args))
    },
}

/**
 * Mapea valores desde queryStrings
 * Recive queryStrings y devuelve un map de { key: value }
 */
function getValuesFromQueryString(string) {
    if (!string) {
        return;
    }
    const removableValues = ['./'];
    const removableKeys = ['sort', 'all', 'order'];

    const array = string.split('?');
    const filtered = array.filter(value => !removableValues.includes(value));
    const splitted = _.flatten(filtered.map(value => value.split('&')));
    const mapped = getKeyValueFromArrayOfQueryString(splitted);
    const splittedWithoutUselessKeys = _.omit(mapped, removableKeys);
    return splittedWithoutUselessKeys;
}

/**
 * Convierte un array de queryStrings en un mapa de { key: value } 
 */
function getKeyValueFromArrayOfQueryString(array) {
    return array.reduce((obj, val) => {
        const association = val.split('=');
        const key = _.first(association);
        const value = _.last(association);
        obj[key] = value;
        return obj;
    }, {});
}

function getEncodedValue(queryString, value) {
    const map = getValuesFromQueryString(queryString);
    let val = map[value];
    if (!val) {
        return Error(`The value ${value} doesn't exist in ${map}`);
    }
    val = val.replace(' ', '%20');
    return val;
}

function getTimeStamp() {
    const date = new Date();
    return `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDay()}-${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`
}

function getDirPath() {
    const date = new Date();
    return `${date.getFullYear()}${path.sep}${MONTH_CODES[date.getMonth()]}`;
}

/**
 * Took from @see https://stackoverflow.com/a/40686853
 */
function mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = isRelativeToScript ? __dirname : '.';
    targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(baseDir, parentDir, childDir);
        try {
            fs.mkdirSync(curDir);
            log.green(`Directory ${curDir} created!`);
        } catch (err) {
            if (err.code !== 'EEXIST') {
                throw err;
            }
            log.red(`Directory ${curDir} already exists!`);
        }

        return curDir;
    }, initDir);
}

module.exports = {
    getPageUrl,
    getPlayerUrl,
    log,
    getValuesFromQueryString,
    getEncodedValue,
    getTimeStamp,
    getDirPath,
    mkDirByPathSync
}