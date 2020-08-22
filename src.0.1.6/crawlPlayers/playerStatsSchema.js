/**
 * Retrieve data only from stats columns (col #2 and #3)
 * @param {Cheerio} $ Cheerio instance
 * @param {number} colNumber 
 */
const getPlayerStatsCol = ($, colNumber) => {
    const column = $('table.player > tbody > tr > td').eq(colNumber + 1);
    const table = $(column).find('table > tbody > tr');
}

module.exports = {
    getPlayerStatsCol
}


const playerStatsSchema = {
    a0: 'attacking',
    a1: 'ballControl',
    a2: 'dribbling',
    a3: 'lowPass',
    a4: 'loftedPass',
    a5: 'finishing',
    a6: 'placeKicking',
    a7: 'swerve',
    a8: 'header',
    a9: 'defense',
    a10: 'ballWinning',
    a11: 'kickingPower',
    a12: 'speed',
    a13: 'explosivePower',
    a14: 'bodyControl',
    a15: 'physicalContact',
    a16: 'jump',
    a17: 'stamina',
    a18: 'goalkeeping',
    a19: 'catching',
    a20: 'clearing',
    a21: 'reflexes',
    a22: 'coverage',
    a23: 'form',
    a24: 'injuryResistance',
    a25: 'weakFootUsage',
    a26: 'weakFootAccuracy',
};

const playerOverallRatingSchema = {
    a23: 'overallRating',
}

const playingStyles = {
    playingStyle: [],
    playerSkills: [],
    comPlayingStyles: []
}

