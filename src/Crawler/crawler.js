const Cheerio = require("cheerio");
const Fs = require("fs");
// const JSON = require("babel-runtime/core-js/json/stringify");
const Promise = require("bluebird");
const Request = require("request-promise");
const Url = require("url");
const _ = require("lodash");
const path = require("path");
const Config = require("../../../config/config");

const utils = require("../utils");

const DEBUG = true;

/**
 * @see https://scotch.io/tutorials/scraping-the-web-with-node-js
 */
class Crawler {
	constructor() {
		this.baseUrl = "http://pesdb.net/pes2018/";
		this.baseOptions = this.composeOptions(this.baseUrl);

		this.state = {
			byIds: {},
			allIds: [],
			isFetching: false
		};

		this.init();
	}

	init() {
		this.getPlayers();
	}

	/**
     * Update the Class.state
     * @param {object} newState 
     */
	setState(newState, callback) {
		const state = this.state;
		const nextState = {
			...state,
			...newState
		};
		this.state = nextState;
		if (_.isFunction(callback)) {
			callback();
		}
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

	/**
     * Get Array of Pagination urls to crawl later
     */
	getPages() {
		const options = this.composeOptions(this.baseUrl);

		return new Promise((resolve, reject) => {
			Request(options)
				.then($ => {
					const totalPages = $("div.pages a")
						.last()
						.text();
					if (DEBUG) {
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

	/**
     * Crawl Players rows
     */
	crawlPages() {
		return this.getPages().then(pages => {
			if (DEBUG) {
				console.log("======================================");
				console.log("getPages");
				console.log(
					pages.slice(0, 3),
					`and ${pages.length - 2} more...`
				);
			}
			return Promise.all(
				pages.slice(0, 1).map((url, index) => {
					const options = this.composeOptions(url);
					const currentPage = index + 1;

					if (DEBUG) {
						console.log(`URL to fetch ${url}`);
					}

					return Request(options).then($ => {
						const rows = this.getRows($, {
							currentPage
						});
						const players = this.crawlPlayerProfile(rows);
						return players;
					});
				})
			)
				.then(players => {
					const response = _.flatten(players);

					/**
                     * Save id's con the class state
                     */
					const allIds = response.map(player => player.id);
					this.setState({ allIds });

					console.log("======================================");
					console.log(`Total response length: ${response.length}`);
					if (DEBUG) {
						console.log("First three names");
						response
							.slice(0, 3)
							.forEach(player =>
								console.log(`${player.id} | ${player.name}`)
							);
					}
					return response;
				})
				.catch(err => {
					throw err;
				});
		});
	}

	/**
     * 
     * @param {Players[]} rows 
     */
	crawlPlayerProfile(rows) {
		let players = rows;
		if (DEBUG) {
			players = rows.slice(0, 3);
		}
		return new Promise.all(
			players.map(player => {
				const options = this.composeOptions(player.link);

				return Request(options).then($ => {
					const statsRow = $("table.player tbody tr").first();
					// Remove the last column (player skills)
					const columns = $(statsRow)
						.children("td")
						.slice(0, 3);
					// TODO: Iterate this column on a diferent way
					const skillsColumn = $(statsRow)
						.children("td")
						.last();
					// Collect the player stats
					const stats = {};
					$(columns).each((i, column) => {
						const table = $(column).find("table tbody");
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
								rowLabel = rowLabel.slice(
									0,
									rowLabel.length - 1
								);
							}

							let rowValue = $(row)
								.children("td")
								.text();
							if (utils.isNumeric(rowValue)) {
								rowValue = +rowValue;
							}

							if (
								i === columns.length - 1 &&
								j === rows.length - 1
							) {
								const ratingAs = this.getRatingAs($, row);
								stats.as = ratingAs;
								return;
							}

							stats[rowLabel] = rowValue;
						});
					});
					player.stats = stats;
					return player;
				});
			})
		).then(playersProfile => {
			return playersProfile;
		});
	}

	getPlayers() {
		const fileName = this.getFilename();
		const version = require("./../../../package.json").version;
		const dir = path.resolve(Config.output, `v${version}`);
		const file = path.resolve(dir, `players_${fileName}.json`);
		const pages = this.crawlPages();

		const result = pages.then(players => {
			if (!Fs.existsSync(dir)) {
				console.log("======================================");
				console.log(`Creating directory in ${dir}`);
				Fs.mkdirSync(dir);
			} else if (Fs.existsSync(file)) {
				console.log("======================================");
				console.log(`File ${file} already exist`);
				return;
			}

			console.log("======================================");
			console.log(
				`Writing file in ${file} with ${players.length} players fetched`
			);
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
				height: utils.makeNumeric(columns.eq(4).text()),
				weight: utils.makeNumeric(columns.eq(5).text()),
				age: utils.makeNumeric(columns.eq(6).text()),
				condition: utils.makeNumeric(columns.eq(7).text()),
				overalRating: utils.makeNumeric(columns.eq(8).text()),
				stats: {},
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
		let result = href.match(onlyNumbers);
		result = utils.makeNumeric(result);
		return result.length ? result[0] : result;
	}

	/**
     * 'Rating as' is treated different
     */
	getRatingAs($, row) {
		const options = $(row)
			.find("#select_rating_as")
			.children("option");
		const ratingAs = {};
		options.each((k, option) => {
			const valueAttr = $(option).attr("value");
			let value = $(valueAttr).text();
			const label = $(option).text();
			value = utils.makeNumeric(value);
			ratingAs[label] = value;
		});
		return ratingAs;
	}
}

module.exports = Crawler;
