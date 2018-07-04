const Promise = require('bluebird');
const request = require('request-promise');
const cheerio = require('cheerio').load;
const _ = require('lodash');
const utils = require('./utils');
const config = require('./config');



async function fetch(url, resolve, reject, options = { delay: config.THROTTLE }) {
    // return promiseDelay(config.THROTTLE).then(() => {

    utils.log.green('> FETCHING', url);
    return await Promise.delay(options.delay).then(() => {
        return request(url)
            .then((htmlString) => {
                const $ = cheerio(htmlString);
                return resolve($);
            })
            .catch((err) => {
                // Crawling failed...
                utils.log.red('> Crawler ERROR on fetching:', url);
                console.error(err.mesage || err);
                if (_.isFunction(reject)) {
                    reject(err)
                }
            });
    }).catch(err => {
        utils.log.red('> Proimse.delay ERROR');
        console.error(err.mesage || err);
    })
}

async function promiseDelay(ms) {
    const multi = new progress(ms);
    let countDown = ms;
    const bar = multi.newBar('[:current] seconds until fetching :bar', {
        complete: '=',
        incomplete: ' ',
        total: ms
    });
    const timer = await setInterval(() => {
        countDown = countDown - 1000;
        bar.tick();
        // utils.log.red(`${countDown / 1000} seconds until fetching...`, url);
        // if (countDown <= 0) {
        if (bar.complete) {
            clearInterval(timer);
        }
    }, 1000);
}

module.exports = fetch;
