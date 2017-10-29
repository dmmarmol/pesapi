const path = require("path");
const Express = require("express");
const Fs = require("fs");
const Request = require("request-promise");
const Promise = require("bluebird");
const Cheerio = require("cheerio");
const Url = require("url");
const _ = require("lodash");
const App = Express();

const debug = true;

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

const composeOptions = url => ({
	url: Url.resolve(url, ""),
	transform: function(body) {
		return Cheerio.load(body);
	}
});

const options = composeOptions("http://pesdb.net/pes2018/");

const getPages = () => {
	return new Promise((resolve, reject) => {
		Request(options)
			.then($ => {
				const totalPages = $("div.pages a")
					.last()
					.text();
				if (debug) {
					console.log(`Total Pages: ${totalPages}`);
				}

				//  Mock pages links
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
				resolve(pages);
			})
			.catch(err => {
				reject(err);
			});
	});
};

const crawlPages = () => {
	return getPages().then(pages => {
		if (debug) {
			console.log("======================================");
			console.log("getPages");
			console.log(pages.slice(0, 3), `and ${pages.length - 2} more...`);
			console.log("======================================");
		}
		return Promise.all(
			pages.slice(0, 3).map((url, index) => {
				const options = composeOptions(url);
				const currentPage = index + 1;

				if (debug) {
					console.log(`URL to fetch ${url}`);
				}

				return Request(options).then($ => {
					const rows = getRows($, {
						currentPage
					});
					return rows;
				});
			})
		)
			.then(pages => {
				const response = _.flatten(pages);
				if (debug) {
					console.log("======================================");
					console.log(`Total response length: ${response.length}`);
					console.log(
						`First three names: ${response[0].name}, ${response[1]
							.name} and ${response[2].name}`
					);
				}
				return response;
			})
			.catch(err => {
				throw err;
			});
	});
};

const getPlayers = () => {
	const timestamp = getTimestamp();
	const version = require("./package.json").version;
	const dir = path.resolve(__dirname, `output/v${version}`);
	const file = path.resolve(dir, `players_${timestamp}.json`);

	const result = crawlPages().then(players => {
		if (!Fs.existsSync(dir)) {
			Fs.mkdirSync(dir);
			if (debug) {
				console.log("======================================");
				console.log(`Creating directory in ${dir}`);
			}
		} else if (Fs.existsSync(file)) {
			if (debug) {
				console.log("======================================");
				console.log(`File ${file} already exist`);
			}
			return;
		}

		if (debug) {
			console.log("======================================");
			console.log(
				`Writing file in ${file} with ${players.length} players fetched`
			);
		}
		Fs.writeFileSync(file, JSON.stringify(players), null, 4);
		return players;
	});

	return result;
};

const getRows = (html, { currentPage }) => {
	const $ = html;
	const rows = $("table.players tbody tr");

	const result = [];

	$(rows).each((i, row) => {
		const columns = $($(row).find("td"));

		// Skip columns without text
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
	const onlyNumbers = /\d+/g;
	// Get only numbers from `./?id=4522`
	const result = href.match(onlyNumbers);
	return result.length ? result[0] : result;
};

getPlayers();

// module.export = App;
