const Cheerio = require("cheerio");
const Fs = require("fs");
// const JSON = require("babel-runtime/core-js/json/stringify");
const Promise = require("bluebird");
const Request = require("request-promise");
const Url = require("url");
const _ = require("lodash");
const path = require("path");
const Config = require("../../../config/config");

/**
 * @see https://scotch.io/tutorials/scraping-the-web-with-node-js
 */
class Crawler {
	constructor() {
		this.baseUrl = "http://pesdb.net/pes2018/";
		this.baseOptions = this.composeOptions(this.baseUrl);
		this.debug = true;

		this.init();
	}

	init() {
		this.getPlayers();
	}

	composeOptions(url) {
		return {
			url: Url.resolve(url, ""),
			transform: function(body) {
				return Cheerio.load(body);
			}
		};
	}

	getFilename() {
		const today = new Date();
		const dd = today.getDate();
		const mm = today.getMonth() + 1; //January is 0!
		const yyyy = today.getFullYear();
		const hs = today.getHours();
		const min = today.getMinutes();
		const sec = today.getSeconds();

		const date = `${dd}_${mm}_${yyyy}-${hs}-${min}-${sec}`;
		return date;
	}

	getPages() {
		const options = this.composeOptions(this.baseUrl);

		return new Promise((resolve, reject) => {
			Request(options)
				.then($ => {
					const totalPages = $("div.pages a")
						.last()
						.text();
					if (this.debug) {
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
	}

	crawlPages() {
		return this.getPages().then(pages => {
			if (this.debug) {
				console.log("======================================");
				console.log("getPages");
				console.log(
					pages.slice(0, 3),
					`and ${pages.length - 2} more...`
				);
				console.log("======================================");
			}
			return Promise.all(
				pages.slice(0, 3).map((url, index) => {
					const options = this.composeOptions(url);
					const currentPage = index + 1;

					if (this.debug) {
						console.log(`URL to fetch ${url}`);
					}

					return Request(options).then($ => {
						const rows = this.getRows($, {
							currentPage
						});
						return rows;
					});
				})
			)
				.then(pages => {
					const response = _.flatten(pages);
					if (this.debug) {
						console.log("======================================");
						console.log(
							`Total response length: ${response.length}`
						);
						console.log(
							`First three names: ${response[0]
								.name}, ${response[1].name} and ${response[2]
								.name}`
						);
					}
					return response;
				})
				.catch(err => {
					throw err;
				});
		});
	}

	getPlayers() {
		const fileName = this.getFilename();
		const version = require("./../../../package.json").version;
		const dir = path.resolve(Config.output, `v${version}`);
		const file = path.resolve(dir, `players_${fileName}.json`);

		const result = this.crawlPages().then(players => {
			if (!Fs.existsSync(dir)) {
				if (this.debug) {
					console.log("======================================");
					console.log(`Creating directory in ${dir}`);
				}
				Fs.mkdirSync(dir);
			} else if (Fs.existsSync(file)) {
				if (this.debug) {
					console.log("======================================");
					console.log(`File ${file} already exist`);
				}
				return;
			}

			if (this.debug) {
				console.log("======================================");
				console.log(
					`Writing file in ${file} with ${players.length} players fetched`
				);
			}
			Fs.writeFileSync(file, JSON.stringify(players), null, 4);
			return players;
		});

		return result;
	}

	getRows(html, { currentPage }) {
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
				id: this.getPlayerId(columns),
				link: Url.resolve(
					this.baseOptions.url,
					columns
						.eq(1)
						.find("a")
						.attr("href")
				),
				team: {
					name: columns.eq(2).text(),
					link: Url.resolve(
						this.baseOptions.url,
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
	}

	getPlayerId(columns) {
		const href = columns
			.eq(1)
			.find("a")
			.attr("href");
		const onlyNumbers = /\d+/g;
		// Get only numbers from `./?id=4522`
		const result = href.match(onlyNumbers);
		return result.length ? result[0] : result;
	}
}

module.exports = Crawler;
