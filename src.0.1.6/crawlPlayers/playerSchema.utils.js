const _ = require('lodash');
const utils = require('../utils');

/**
 * Get Column by colNumber
 * @param {cheerio} $ 
 * @param {number} colNumber 
 * @returns $(<tbody>)
 */
const getCol = function ($, colNumber) {
    const column = $('table.player > tbody > tr > td').eq(colNumber);
    const table = $(column).find('table > tbody');
    return $(table);
}

/**
 * Returns the DOM element of the selected col (<td>)
 * @return $(td | DOMelement)
 */
const getElement = ($, { column, row }, tag = 'td') => {
    const statRow = column.find('tr').eq(row);
    const statCol = $(statRow).find(tag);
    return statCol;
}

/**
 * Returns the value of the DOM element from the selected col (<td>)
 * @return string
 */
const getValue = ($, { column, row }) => {
    const element = getElement($, { column, row });
    return element.text();
}

/**
 * Returns the encoded 'href' attr from the children of a <td>
 * @return string
 */
const getEncodedHref = ($, { column, row }, prop) => {
    const element = getElement($, { column, row });
    return utils.getEncodedValue(
        element.children().attr('href'),
        prop
    )
}

/**
 * Returns a full entity with id & name
 * @template Entity
 * @param {Cheerio} $
 * @return Entity 
 */
const getEntity = ($, { column, row }, prop) => ({
    id: getEncodedHref($, { column, row }, prop),
    name: getValue($, { column, row }),
    link: getElement($, { column, row }).children().attr('href')
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

    return {
        ...reducePosition(posFW, 'posFW'),
        ...reducePosition(posMF, 'posMF'),
        ...reducePosition(posDF, 'posDF')
    }
}


const getStats = ($) => {
    const COL_2 = getCol($, 1);
    const COL_3 = getCol($, 2);

    const stats = {
        /** Col #2 */
        attacking: getValue($, { column: COL_2, row: 0 }),
        ballControl: getValue($, { column: COL_2, row: 1 }),
        dribbling: getValue($, { column: COL_2, row: 2 }),
        lowPass: getValue($, { column: COL_2, row: 3 }),
        loftedPass: getValue($, { column: COL_2, row: 4 }),
        finishing: getValue($, { column: COL_2, row: 5 }),
        placeKicking: getValue($, { column: COL_2, row: 6 }),
        swerve: getValue($, { column: COL_2, row: 7 }),
        header: getValue($, { column: COL_2, row: 8 }),
        defense: getValue($, { column: COL_2, row: 9 }),
        ballWinning: getValue($, { column: COL_2, row: 10 }),
        kickingPower: getValue($, { column: COL_2, row: 11 }),
        speed: getValue($, { column: COL_2, row: 12 }),
        explosivePower: getValue($, { column: COL_2, row: 13 }),
        bodyControl: getValue($, { column: COL_2, row: 14 }),
        /** Col #3 */
        physicalContact: getValue($, { column: COL_3, row: 0 }),
        jump: getValue($, { column: COL_3, row: 1 }),
        stamina: getValue($, { column: COL_3, row: 2 }),
        goalkeeping: getValue($, { column: COL_3, row: 3 }),
        catching: getValue($, { column: COL_3, row: 4 }),
        clearing: getValue($, { column: COL_3, row: 5 }),
        reflexes: getValue($, { column: COL_3, row: 6 }),
        coverage: getValue($, { column: COL_3, row: 7 }),
        form: getValue($, { column: COL_3, row: 8 }),
        injuryResistance: getValue($, { column: COL_3, row: 9 }),
        weakFootUsage: getValue($, { column: COL_3, row: 10 }),
        weakFootAccuracy: getValue($, { column: COL_3, row: 11 }),
    };

    /**
     * Turn every value into a Number
     */
    return Object.keys(stats).reduce((acc, stat) => {
        acc[stat] = _.toNumber(stats[stat]);
        return acc;
    }, {});
}

const getRatings = ($) => {
    const COL_3 = getCol($, 2);

    const overallRating = _.toNumber(getValue($, { column: COL_3, row: 13 }));

    /**
     * Gets an array of `<options>` from a given `<select>`
     */
    const ratingAsOptions = $('#select_rating_as').find('option').toArray();
    /**
     * Transform an array of options into a map of { label, value }
     */
    const overallRatingAs = ratingAsOptions.reduce((ratings, rating) => {
        const label = $(rating).text();
        const valueSpan = $(rating).attr('value');
        const value = $(valueSpan).text();
        ratings[label] = _.toNumber(value);
        return ratings;
    }, {});

    return { overallRating, overallRatingAs }
}

const getPlayingStyles = ($) => {

    const COL_4 = getCol($, 3);
    /**
     * Get all childrens (<tr>)
     */
    const rows = COL_4.children();
    /**
     * Create an array of those childrens for iterate them later 
     */
    const children = rows.toArray().map(row => $(row).children());
    /**
     * Get column dividers, since the markup it's horrible
     */
    const dividers = $(rows).find('th').toArray().map(row => $(row).text());

    /**
     * Make an object made of `divider` as prop
     * and an array of values using values between dividers
     */
    const iterate = array => {
        const arrayCopy = [...array];
        let lastDivider = dividers[0];

        return arrayCopy.reduce(function (acc, value, index, list) {
            const prev = list[index === 0 ? 0 : index - 1];

            if (dividers.includes(value)) {
                lastDivider = value;
                acc[lastDivider] = [];
            }

            if ((acc[lastDivider].includes(value)) || value === lastDivider) {
                return acc;
            }

            const newArray = list.filter(item => item !== value);
            acc[lastDivider] = [...acc[lastDivider], value];

            return acc;
        }, {});
    }
    /**
     * Get the content (text) of each row
     */
    const arrayOfRows = children.map(row => $(row).text());
    return iterate(arrayOfRows);
}

module.exports = {
    getCol,
    getElement,
    getValue,
    getEncodedHref,
    getEntity,
    getPositions,
    getStats,
    getRatings,
    getPlayingStyles
}