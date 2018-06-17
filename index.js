require("babel-core");
const path = require("path");
const config = require("./src/config");
const scrape = require("website-scraper");
// const pckg = require("./package.json");
// console.log(pckg);

scrape({
	urls: [config.BASE_URL],
	directory: "./output/v0.0.5"
	// directory: `./output/v${pckg.version}`
})
	.then(result => {
		console.log(result);
	})
	.catch(err => {
		throw err;
	});
