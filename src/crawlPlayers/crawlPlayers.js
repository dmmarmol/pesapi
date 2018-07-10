const _ = require('lodash');
const Promise = require('bluebird');
// Custom Modules
const fetch = require('../fetch');
const config = require("../config");
const utils = require('../utils');
const getPlayersSchema = require('./playerSchema');



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
    utils.log.blue(`> Getting Player: ${$(row.children[1]).text()}`);
    const columns = row.children.reduce((player, column, colIndex) => {
        const col = $(column);
        const href = col.children().attr('href');
        const parsedHref = !!href ? utils.getValuesFromQueryString(href) : {};
        const value = col.text();

        const playerObject = Object.keys(columnMapping).reduce((player, mapValue) => {
            const mapIndex = _.toNumber(mapValue);
            if (colIndex === mapIndex) {
                /** Obtiene la columna */
                const col = columnMapping[colIndex];
                /** Obtiene la funcion que dictara el formato de la columna */
                player[col.name] = col.fn(value);
            }
            return player;
        }, {});

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
 * Look for the player.id's from a given URL
 */
async function getPlayersUrlsFromPage(url) {
    return await fetch(url, ($) => {
        const table = $('table.players');

        /**
         * Process html...
         */
        const rows = table.find('tbody tr').toArray();
        const maxPlayers = config.DEBUG ? config.MAX_PLAYERS_PER_PAGE + 1 : rows.length;
        const players = rows.slice(1, maxPlayers);
        const statsRow = rows[0];

        /**
         * Collect the player ids
         * */
        const playersUrl = players.map((row) => {
            const player = getRowValues($, row);
            const id = _.toNumber(player.id);
            return utils.getPlayerUrl(id);
        });

        return playersUrl;
    })
}

async function getPlayersFromPage(pageUrl) {
    const playersUrl = await getPlayersUrlsFromPage(pageUrl) || [];

    /**
     * EN:
     * Map the array of playersUrl and return a Delayed Promise on each item
     * which once it'll be resolved, it will fetch the given url
     * ES:
     * Mapea el array de playersUlr y devuelve una promesa con delay por cada item
     * donde una vez resuelta, hara un fetch a la url correspondiente
     */
    const urlPromises = Promise.mapSeries(playersUrl,
        (url) => fetch(url, ($) => {
            /**
             * Return player from Player Details Page
             */
            return getPlayersSchema($);
        })
            .then((response) => {
                bar.tick()
                return response;
            })
    ).delay(config.THROTTLE);

    return urlPromises;
}

module.exports = {
    getPlayersUrlsFromPage,
    getPlayersFromPage
}