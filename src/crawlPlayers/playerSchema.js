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
    const COL_1 = getCol($, 0);

    const isFreeAgent = getValue($, { column: COL_1, row: 2 }) === 'Free Agent';

    const skills = [
        'playerName',
        'squadNumber',
        'team',
        'league',
        'nationality',
        'region',
        'height',
        'weight',
        'age',
        'foot',
        'condition',
        'mainPosition',
    ].filter(skill => isFreeAgent ? skill !== 'squadNumber' : true);

    const getRow = (skill) => skills.indexOf(skill);

    return {
        image: '',
        playerName: getValue($, { column: COL_1, row: getRow('playerName') }),
        squadNumber: isFreeAgent ? 0 : _.toNumber(getValue($, { column: COL_1, row: getRow('squadNumber') })),
        team: getEntity($, { column: COL_1, row: getRow('team') }, 'club_team'),
        league: getEntity($, { column: COL_1, row: getRow('league') }, 'league'),
        nationality: getEntity($, { column: COL_1, row: getRow('nationality') }, 'nationality'),
        region: getEntity($, { column: COL_1, row: getRow('region') }, 'region'),
        height: _.toNumber(getValue($, { column: COL_1, row: getRow('height') })),
        weight: _.toNumber(getValue($, { column: COL_1, row: getRow('weight') })),
        age: _.toNumber(getValue($, { column: COL_1, row: getRow('age') })),
        foot: getValue($, { column: COL_1, row: getRow('foot') }),
        condition: getValue($, { column: COL_1, row: getRow('condition') }),
        mainPosition: getValue($, { column: COL_1, row: getRow('mainPosition') }),
        positions: getPositions($),
        ...getRatings($),
        stats: getStats($),
        playingStyles: getPlayingStyles($)
    }
};