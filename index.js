require("babel-core");
const path = require("path");
const config = require("./src/config");
const _ = require('lodash');
const chalk = require('chalk');
const request = require('request-promise');
const cheerio = require('cheerio').load;
const queryString = require('query-string');
// Custom Modules
const crawlPlayers = require('./src/crawlPlayers/crawlPlayers.func');



async function go() {
    try {
        const players = await crawlPlayers.getPlayerValues(1);
        console.log('@await done', players);
        // const coffee2 = await getPlayerValues(2);
        // console.log(coffee2); // ☕
        // const coffee3 = await getPlayerValues(3);
        // console.log(coffee3); // ☕
    } catch (error) {
        console.log(error);
    }
}

go();



function getPlayerStatsOld(column) {
    $(column).find("table tbody");
    const rows = $(table).children("tr");
    /**
     * Iterate over each player stat
     */
    rows.each((j, row) => {
        let rowLabel = $(row)
            .children("th")
            .text();
        rowLabel = utils.camelize(rowLabel);
        if (!rowLabel) {
            return;
        }
        if (rowLabel[rowLabel.length - 1] === ":") {
            rowLabel = rowLabel.slice(0, rowLabel.length - 1);
        }

        let rowValue = $(row)
            .children("td")
            .text();
        if (utils.isNumeric(rowValue)) {
            rowValue = +rowValue;
        }

        if (i === columns.length - 1 && j === rows.length - 1) {
            const ratingAs = this.getRatingAs($, row);
            stats.as = ratingAs;
            return;
        }

        stats[rowLabel] = rowValue;
    });
}