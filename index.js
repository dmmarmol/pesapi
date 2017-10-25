const path = require('path');
const Express = require('express');
const Fs = require('fs');
const Request = require('request');
const Cheerio = require('cheerio');
const App = Express();

const getTimestamp = () => {
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth() + 1; //January is 0!
    const yyyy = today.getFullYear();
    const hs = today.getHours();
    const min = today.getMinutes();
    const sec = today.getSeconds();

    const date = `${dd}_${mm}_${yyyy}-${hs}-${min}-${sec}`
    return date;
}

/**
 * @see https://scotch.io/tutorials/scraping-the-web-with-node-js
 */
App.get('/scrape', (req, res) => {
    // The URL we will scrape from - in our example Anchorman 2.
    const url = 'http://pesdb.net/pes2018/';
    const timestamp = getTimestamp();
    const file = path.resolve(__dirname, `output/test_${timestamp}.json`);

    // console.log(file);

    Request(url, function(error, response, html) {

        // First we'll check to make sure no errors occurred when making the request
        if (!error /* && !Fs.existsSync(file) */ ) {
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            const $ = Cheerio.load(html);

            const rows = $('table.players tbody tr');

            const json = [];

            $(rows).each((i, row) => {
                const cols = $(row).find('td');

                const c = $(cols);

                /**
                 * Skip columns without text
                 */
                if (!c.eq(1).text()) {
                    return;
                }

                json.push({
                    position: c.eq(0).text(),
                    name: c.eq(1).text(),
                    team: c.eq(2).text(),
                    nationality: c.eq(3).text(),
                    height: c.eq(4).text(),
                    weight: c.eq(5).text(),
                    age: c.eq(6).text(),
                    condition: c.eq(7).text(),
                    rating: c.eq(8).text(),
                });
            });

            res.json(json);

        }
    })
})

App.listen(8081);

console.log('Server listening in port 8081');

module.export = App;