const _ = require('lodash');
const chalk = require('chalk');
const config = require('./config');

// function camelize(str) {
//     return str
//         .replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
//             return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
//         })
//         .replace(/\s+/g, "");
// }

// function isNumeric(num) {
//     return !isNaN(num);
// }

// function makeNumeric(num) {
//     if (!isNumeric(num)) {
//         return +num;
//     }
//     return num;
// }

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
const log = {
    white: (value, ...args) => console.log(
        `${chalk.black.bgWhite(value)}:`,
        chalk.black.bgWhite(...args)
    ),
    red: (value, ...args) => console.log(
        chalk.whiteBright.bgRed(`${value}:`),
        chalk.whiteBright.bgRed(...args)
    ),
    green: (value, ...args) => console.log(
        chalk.whiteBright.bgGreen(`${value}:`),
        chalk.whiteBright.bgGreen(...args)
    ),
    blue: (value, ...args) => console.log(
        chalk.whiteBright.bgBlue(`${value}:`),
        chalk.whiteBright.bgBlue(...args)
    ),
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
    // console.log('@array', array);
    const filtered = array.filter(value => !removableValues.includes(value));
    // console.log('@filtered', filtered);
    const splitted = _.flatten(filtered.map(value => value.split('&')));
    // console.log('@splitted', splitted);
    const mapped = getKeyValueFromArrayOfQueryString(splitted);
    // console.log('@mapped', mapped);
    const splittedWithoutUselessKeys = _.omit(mapped, removableKeys);
    // console.log('@splittedWithoutUselessKeys', splittedWithoutUselessKeys);
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
        console.error(`The value ${value} doesn't exist in ${map}`)
        return;
    }
    val = val.replace(' ', '%20');
    if (_.isNumber(_.toNumber(val))) {
        return _.toNumber(val);
    }
    return val;
}

module.exports = {
    // camelize,
    // isNumeric,
    // makeNumeric,
    getPageUrl,
    getPlayerUrl,
    log,
    getValuesFromQueryString,
    getEncodedValue
}