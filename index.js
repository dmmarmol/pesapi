const path = require("path");
const Express = require("express");
const Fs = require("fs");
const Request = require("request");
const Cheerio = require("cheerio");
const App = Express();

const getTimestamp = () => {
	const today = new Date();
	const dd = today.getDate();
	const mm = today.getMonth() + 1; //January is 0!
	const yyyy = today.getFullYear();
	const hs = today.getHours();
	const min = today.getMinutes();
	const sec = today.getSeconds();

	const date = `${dd}_${mm}_${yyyy}-${hs}-${min}-${sec}`;
	return date;
};

/**
 * @see https://scotch.io/tutorials/scraping-the-web-with-node-js
 */
App.get("/", (req, res) => {
	res.write();
});

App.get("/scan", (req, res) => {
	// The URL we will scrape from - in our example Anchorman 2.
	const url = "http://pesdb.net/pes2018/";
	const timestamp = getTimestamp();
	const file = path.resolve(__dirname, `output/test_${timestamp}.json`);

	// console.log(file);

	Request(url, function(error, response, html) {
		// First we'll check to make sure no errors occurred when making the request
		if (!error /* && !Fs.existsSync(file) */) {
			// Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

			const $ = Cheerio.load(html);

			const rows = $("table.players tbody tr");

			const json = [];

			$(rows).each((i, row) => {
				const columns = $($(row).find("td"));

				/**
                 * Skip columns without text
                 */
				if (!columns.eq(1).text()) {
					return;
				}

				json.push({
					position: columns.eq(0).text(),
					name: columns.eq(1).text(),
					team: columns.eq(2).text(),
					nationality: columns.eq(3).text(),
					height: columns.eq(4).text(),
					weight: columns.eq(5).text(),
					age: columns.eq(6).text(),
					condition: columns.eq(7).text(),
					rating: columns.eq(8).text()
				});
				let currentPage = 0;
				res.write(`<p>Current Page: ${currentPage}</p>`);
			});

			const totalPages = $("div.pages a")
				.last()
				.text();
			// const nextPage;

			// console.log(totalPages);
			res.write(`<p>Total Pages: ${totalPages}</p>`);
			res.write("<hr />");
			res.write("<code>");
			res.write(JSON.stringify(json));
			res.write("</code>");

			res.end();

			res.json(json);
		}
	});
});

App.listen(8081);

console.log("Server listening in port 8081");

module.export = App;
