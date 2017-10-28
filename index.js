const path = require("path");
const Express = require("express");
const Fs = require("fs");
const Request = require("request-promise");
const Cheerio = require("cheerio");
const Url = require("url");
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
// The URL we will scrape from - in our example Anchorman 2.
const timestamp = getTimestamp();
const file = path.resolve(__dirname, `output/test_${timestamp}.json`);

// console.log(file);

const options = {
	url: "http://pesdb.net/pes2018/",
	transform: function(body) {
		return Cheerio.load(body);
	}
};

Request(options)
	.then($ => {
		const totalPages = $("div.pages a")
			.last()
			.text();

		console.log(`<p>Total Pages: ${totalPages}</p>`);
		console.log("<hr />");

		/**
             * Mock pages links
             */
		const pages = Array.apply(null, {
			length: totalPages
		})
			.map((value, index) => {
				if (index === 1) return options.url;
				return Url.resolve(options.url, `?page=${index}`);
			})
			.filter((value, index) => {
				if (index === 0) return;
				return value;
			});
		/* 
             */

		/** Cut the pages array for testing proposes */
		// const fakePages = pages.slice(0, 3);
		// const roster = [];
		// console.log(fakePages);

		// Request.all(fakePages).then(htmls => {
		// 	roster = htmls.map((html, currentPage) => {
		// 		const $ = Cheerio.load(html);

		// 		const players = getRows(html, { currentPage });
		// 		roster.push(players);
		// 	});
		// });

		const roster = pages.slice(0, 3).reduce((players, url, currentPage) => {
			console.log(players, url, currentPage);
			Request({
				url,
				transform: function(body) {
					return Cheerio.load(body);
				}
			})
				.then($ => {
					const rows = getRows($, { currentPage });
					// console.log(rows);
					players.push(rows);
					// console.log(players);
					// players = players.concat(rows);
				})
				.catch(err => {
					throw err;
				});
			// console.log(players);
			return players;
		}, []);

		console.log("<h1>Roster</h1>");
		// console.log(JSON.stringify(roster));
	})
	.catch(err => {
		throw err;
	});

const getRows = (html, { currentPage }) => {
	const $ = html;
	const rows = $("table.players tbody tr");

	const result = [];

	$(rows).each((i, row) => {
		const columns = $($(row).find("td"));

		/**
         * Skip columns without text
         */
		if (!columns.eq(1).text()) {
			return;
		}

		result.push({
			position: columns.eq(0).text(),
			name: columns.eq(1).text(),
			id: getPlayerId(columns),
			link: Url.resolve(
				options.url,
				columns
					.eq(1)
					.find("a")
					.attr("href")
			),
			team: {
				name: columns.eq(2).text(),
				link: Url.resolve(
					options.url,
					columns
						.eq(2)
						.find("a")
						.attr("href")
				)
			},
			nationality: columns.eq(3).text(),
			height: columns.eq(4).text(),
			weight: columns.eq(5).text(),
			age: columns.eq(6).text(),
			condition: columns.eq(7).text(),
			overalRating: columns.eq(8).text(),
			rating: {},
			meta: {
				page: currentPage
			}
		});
	});

	return result;
};

const getPlayerId = columns => {
	const href = columns
		.eq(1)
		.find("a")
		.attr("href");
	// TODO:
	// Cut the string since `./?id=`
	return "fakeId";
};

// module.export = App;
