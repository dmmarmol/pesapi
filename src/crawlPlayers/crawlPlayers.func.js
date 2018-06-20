const _ = require('lodash');
const request = require('request-promise');
const cheerio = require('cheerio').load;
// Custom Modules
const config = require("../config");
const utils = require('../utils');


const columnMapping = {
    0: 'position',
    1: 'name',
    2: 'teamName',
    3: 'nationality',
    4: 'height',
    5: 'weight',
    6: 'age',
    7: 'condition',
    8: 'overallRating'
}

const columnValueFormat = {
    [columnMapping[0]]: _.toString,
    [columnMapping[1]]: _.toString,
    [columnMapping[2]]: _.toString,
    [columnMapping[3]]: _.toString,
    [columnMapping[4]]: _.toNumber,
    [columnMapping[5]]: _.toNumber,
    [columnMapping[6]]: _.toNumber,
    [columnMapping[7]]: _.toString,
    [columnMapping[8]]: _.toNumber
}

function getRowValues($, row) {
    console.log('======================');
    console.log('Get Players row values');
    const columns = row.children.reduce((player, column, colIndex) => {
        // console.log(column);
        const col = $(column);
        // console.log(col);
        const href = col.children().attr('href');
        // console.log('@href', href);
        const parsedHref = !!href ? utils.getValuesFromQueryString(href) : {};
        // console.log('@parsedHref', parsedHref);
        const value = col.text();
        // console.log('@value', value);
        const playerObject = Object.keys(columnMapping).reduce((player, mapValue) => {
            // log.white('@mapValue', mapValue);
            // log.blue('@colIndex', colIndex);
            // log.red('@colIndex === mapValue', colIndex === _.toNumber(mapValue));
            // console.log('@columnMapping[colIndex]', columnMapping[colIndex]);
            const mapIndex = _.toNumber(mapValue);
            if (colIndex === mapIndex) {
                /** Obtiene la columna */
                const i = columnMapping[colIndex];
                const columnName = columnMapping[mapValue];
                /** Obtiene la funcion que dictara el formato de la columna */
                const fn = columnValueFormat[columnName];
                player[i] = fn(value);
            }
            return player;
        }, {});
        // console.log('@playerObject', playerObject);
        // console.log('@player', player);
        return { ...player, ...playerObject, ...parsedHref };
    }, {});
    return columns;
}

function getPlayerValues(index) {
    return request(config.BASE_URL)
        .then(function (htmlString) {
            const $ = cheerio(htmlString);
            const table = $('table.players');
            console.log('index', index);

            /**
             * Process html...
             */
            const rows = table.find('tbody tr').toArray();
            const players = rows.slice(1, 3/* rows.length */);
            // console.log(players);
            const statsRow = rows[0];

            // Remove the last column (player skills)
            const columns = $(statsRow)
                .children("td")
                .slice(0, 3);
            // TODO: Iterate this column on a diferent way
            const skillsColumn = $(statsRow)
                .children("td")
                .last();
            // Collect the player stats
            // console.log(players);
            const values = players.reduce((acc, row, j) => {
                const player = getRowValues($, row);
                const id = _.toNumber(player.id);
                acc[id] = player;
                return acc;
            }, {});
            // console.log(values);
            return values;
        })
        .catch(function (err) {
            // Crawling failed...
            console.log('PROMISE ERROR');
            console.log(err);
        });
}

module.exports = {
    getPlayerValues
}