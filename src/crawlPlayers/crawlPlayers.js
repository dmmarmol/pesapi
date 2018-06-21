const _ = require('lodash');
const Promise = require('bluebird');
const progress = require('multi-progress');
// Custom Modules
const fetch = require('../fetch');
const config = require("../config");
const utils = require('../utils');


const columnMapping = {
    0: { name: 'position', fn: _.toString },
    1: { name: 'name', fn: _.toString },
    2: { name: 'teamName', fn: _.toString },
    3: { name: 'nationality', fn: _.toString },
    4: { name: 'height', fn: _.toNumber },
    5: { name: 'weight', fn: _.toNumber },
    6: { name: 'age', fn: _.toNumber },
    7: { name: 'condition', fn: _.toString },
    8: { name: 'overallRating', fn: _.toNumber }
}

function getRowValues($, row) {
    // console.log($(row.children[1]).text());
    utils.log.blue(`> Getting Player: ${$(row.children[1]).text()} row values`);
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
                const col = columnMapping[colIndex];
                /** Obtiene la funcion que dictara el formato de la columna */
                player[col.name] = col.fn(value);
            }
            return player;
        }, {});
        // console.log('@playerObject', playerObject);
        // console.log('@player', player);
        return {
            ...player,
            ...playerObject,
            ...parsedHref,
            href: utils.getPlayerUrl(player.id)
        };
    }, {});
    return columns;
}

/**
 * Busca los player.id de una url provista 
 */
async function getPlayersUrlsFromPage(url) {
    return await fetch(url, ($) => {
        const table = $('table.players');

        /**
         * Process html...
         */
        const rows = table.find('tbody tr').toArray();
        const maxPlayers = config.DEBUG ? 3 : rows.length;
        const players = rows.slice(1, maxPlayers);
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
        // Collect the player ids
        // console.log(players);
        const playersUrl = players.map((row) => {
            const player = getRowValues($, row);
            const id = _.toNumber(player.id);
            return utils.getPlayerUrl(id);
        });
        // console.log('@url', url);
        // console.log('@playersUrl', playersUrl);
        return playersUrl;
    })
}

async function getPlayersFromPage(pageUrl) {
    const playersUrl = await getPlayersUrlsFromPage(pageUrl) || [];
    // console.log('@playersUrl', playersUrl);
    // return;
    /**
     * EN:
     * Map the array of playersUrl and return a Delayed Promise on each item
     * which once it'll be resolved, it will fetch the given url
     * ES:
     * Mapea el array de playersUlr y devuelve una promesa con delay por cada item
     * donde una vez resuelta, hara un fetch a la url correspondiente
     */
    const urlPromises = playersUrl.map(async url => {
        // return promiseDelay(config.THROTTLE).then(() => {
        return await fetch(url, ($) => {
            /**
             * Return player from Player Details Page
             */
            const playerName = $('table.player tbody tr td table tbody tr th').text();
            return playerName;
        })
        // })
    });
    // console.log('@urlPromises', urlPromises);
    return urlPromises;
}

module.exports = {
    getPlayersUrlsFromPage,
    getPlayersFromPage
}