require("babel-core");
const path = require("path");
const config = require("./src/config");
const request = require('request-promise');
const cheerio = require('cheerio').load;
const queryString = require('query-string');

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
            const players = rows.slice(1, rows.length);
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
            const values = players.reduce((acc, row) => {
                const player = getRowValues($, row);
                // console.log(player);
                acc[j] = player;
                return acc;
            }, {});
            return values;
        })
        .catch(function (err) {
            // Crawling failed...
            console.log('err')
        });
}

async function go() {
    try {
        const players = await getPlayerValues(1);
        console.log(players);
        // const coffee2 = await getPlayerValues(2);
        // console.log(coffee2); // ☕
        // const coffee3 = await getPlayerValues(3);
        // console.log(coffee3); // ☕
    } catch (error) {
        console.log(error);
    }
}

go();

function getRowValues($, row) {
    console.log('======================');
    console.log('Get Players row values');
    return row.children.map(column => {
        const col = $(column);
        // const href = col.children().attr('href');

        // console.log(col.text());
        return col.text();
    });
}

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