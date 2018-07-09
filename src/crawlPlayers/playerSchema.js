const _ = require('lodash');
const utils = require('../utils');
const playerUtils = require('./playerSchema.utils');
const { getCol,
    getElement,
    getValue,
    getEncodedHref,
    getEntity,
    getPositions,
    getStats,
    getRatings,
    getPlayingStyles
} = playerUtils;

module.exports = ($) => {

    // utils.log.blue('COL_1');
    const COL_1 = getCol($, 0);

    return {
        image: '',
        playerName: getValue($, { column: COL_1, row: 0 }),
        squadNumber: _.toNumber(getValue($, { column: COL_1, row: 1 })),
        team: getEntity($, { column: COL_1, row: 2 }, 'club_team'),
        league: getEntity($, { column: COL_1, row: 3 }, 'league'),
        nationality: getEntity($, { column: COL_1, row: 4 }, 'nationality'),
        region: getEntity($, { column: COL_1, row: 5 }, 'region'),
        height: _.toNumber(getValue($, { column: COL_1, row: 6 })),
        weight: _.toNumber(getValue($, { column: COL_1, row: 7 })),
        age: _.toNumber(getValue($, { column: COL_1, row: 8 })),
        foot: getValue($, { column: COL_1, row: 9 }),
        condition: getValue($, { column: COL_1, row: 10 }),
        mainPosition: getValue($, { column: COL_1, row: 11 }),
        positions: getPositions($),
        ...getRatings($),
        stats: getStats($),
        playingStyles: getPlayingStyles($)
    }
};