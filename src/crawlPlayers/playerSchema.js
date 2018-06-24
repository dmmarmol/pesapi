const _ = require('lodash');
/*
$('table.players tbody tr td:eq(0) table tbody')
$('table.players tbody tr td:eq(1) table tbody')
$('table.players tbody tr td:eq(2) table tbody')
$('table.players tbody tr td:eq(3) table tbody')
*/

// $('table.player tbody tr td table tbody tr th').text();
const getCol = ($, colNumber) => $($('table.player tbody tr td').eq(colNumber).find('table tbody'));

const getValue = ($, column, tdNumber) => {
    const statRow = column.find('tr').eq(tdNumber);
    const statCol = $(statRow).find('td');
    return statCol.text();
}

const getPositions = ($, positions) => {
    return positions;
}

const getPlayerSchema = ($) => {


    // console.log('@COL_1', COL_1)

    return {
        image: '',
        playerName: getValue($, COL_1, 0),
        squadNumber: _.toNumber(getValue($, COL_1, 1)),
        team: {
            id: 'MISSING_VALUE', // <- generate id from name
            name: getValue($, COL_1, 2)
        },
        league: {
            id: 'MISSING_VALUE',
            name: getValue($, COL_1, 3)
        },
        nationality: {
            id: 'MISSING_VALUE',
            name: getValue($, COL_1, 4)
        },
        region: {
            id: 'MISSING_VALUE',
            name: getValue($, COL_1, 5)
        },
        height: _.toNumber(getValue($, COL_1, 6)),
        weight: _.toNumber(getValue($, COL_1, 7)),
        age: _.toNumber(getValue($, COL_1, 8)),
        foot: getValue($, COL_1, 9),
        condition: getValue($, COL_1, 10),
        mainPosition: getValue($, COL_1, 11),
        positions: getPositions($, getValue($, COL_1, 12)),
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