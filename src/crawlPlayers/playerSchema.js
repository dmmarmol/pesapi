const _ = require('lodash');
const utils = require('../utils');
/*
$('table.players tbody tr td:eq(0) table tbody')
$('table.players tbody tr td:eq(1) table tbody')
$('table.players tbody tr td:eq(2) table tbody')
$('table.players tbody tr td:eq(3) table tbody')
*/

// $('table.player tbody tr td table tbody tr th').text();
/**
 * Get Column by colIndex
 * @param {cheerio} $ 
 * @param {number} colIndex 
 */
const getCol = ($, colIndex) => $($('table.player tbody tr td').eq(colIndex).find('table tbody'));

/**
 * Returns the DOM element of the selected col (<td>)
 */
const getElement = ($, column, tdIndex) => {
    const statRow = column.find('tr').eq(tdIndex);
    const statCol = $(statRow).find('td');
    return statCol;
}

/**
 * Returns the value of the DOM element from the selected col (<td>)
 */
const getValue = ($, column, tdIndex) => {
    const element = getElement($, column, tdIndex);
    return element.text();
}

/**
 * Returns the encoded 'href' attr from the children of a <td>
 */
const getEncodedHref = ($, column, tdIndex, prop) => {
    const element = getElement($, column, tdIndex);
    return utils.getEncodedValue(
        element.children().attr('href'),
        prop
    )
}

/**
 * Returns a full entity with id & name
 */
const getEntity = ($, column, tdIndex, prop) => ({
    id: getEncodedHref($, column, tdIndex, prop),
    name: getValue($, column, tdIndex)
})

/**
 * Return an array of field positions containing
 * information about whether the player can play on that
 * position or not
 * @typedef {Object} Position
 * @property {string} shortName Position short Name
 * @property {string} name Position name
 * @property {string} area Field area where this position belongs
 * @property {boolean} canPlay `true` if the player can play in that position
 *
 * @return {Position} 
 */
const getPositions = ($) => {
    const column = $('td.positions');
    const posFW = $(column).find('.posFW span').toArray();
    const posMF = $(column).find('.posMF span').toArray();
    const posDF = $(column).find('.posDF span').toArray();

    const reducePosition = (pos, area) => pos.reduce((acc, spanPos) => {
        const className = $(spanPos).attr('class');
        const shortName = $(spanPos).text();

        acc[shortName] = {
            shortName,
            name: $(spanPos).attr('title'),
            area,
            /** If pos0, that means the player can't play in that position */
            canPlay: !className.includes('pos0')
        };
        return acc;
    }, {});

    return { ...reducePosition(posFW, 'posFW'), ...reducePosition(posMF, 'posMF'), ...reducePosition(posDF, 'posDF') }
}

const getPlayerSchema = ($) => {

    const COL_1 = getCol($, 0);
    // console.log('@COL_1', COL_1);
    console.log('@getPositions($)', getPositions($));

    return {
        image: '',
        playerName: getValue($, COL_1, 0),
        squadNumber: _.toNumber(getValue($, COL_1, 1)),
        team: getEntity($, COL_1, 2, 'club_team'),
        league: getEntity($, COL_1, 3, 'league'),
        nationality: getEntity($, COL_1, 4, 'nationality'),
        region: getEntity($, COL_1, 5, 'region'),
        height: _.toNumber(getValue($, COL_1, 6)),
        weight: _.toNumber(getValue($, COL_1, 7)),
        age: _.toNumber(getValue($, COL_1, 8)),
        foot: getValue($, COL_1, 9),
        condition: getValue($, COL_1, 10),
        mainPosition: getValue($, COL_1, 11),
        positions: getPositions($),
        overallRating: '',
        overallRatingAs: {

        },
        stats: {
            attacking: '',
            ballControl: '',
            dribbling: '',
            lowPass: '',
            loftedPass: '',
            finishing: '',
            placeKicking: '',
            swerve: '',
            header: '',
            defense: '',
            ballWinning: '',
            kickingPower: '',
            speed: '',
            explosivePower: '',
            bodyControl: '',
            physicalContact: '',
            jump: '',
            stamina: '',
            goalkeeping: '',
            catching: '',
            clearing: '',
            reflexes: '',
            coverage: '',
            form: '',
            injuryResistance: '',
            weakFootUsage: '',
            weakFootAccuracy: ''
        },
        playingStyles:
        {
            playingStyle: [],
            playerSkills: [],
            comPlayingStyles: []
        },

    }
};

module.exports = getPlayerSchema;