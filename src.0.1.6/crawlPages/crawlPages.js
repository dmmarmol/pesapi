const _ = require('lodash');
// Custom Modules
const fetch = require('../fetch');
const config = require("../config");
const utils = require('../utils');


async function getListOfPagesUrl(pageNumber) {
    const url = config.BASE_URL;
    return await fetch(url, ($) => {
        const links = $('.pages a').toArray();
        const first = _.first(links);
        const last = _.last(links);
        const firstIndex = _.toNumber($(first).text());
        const lastIndex = config.DEBUG ? config.MAX_PAGES : _.toNumber($(last).text());

        /**
         * Crea un array de paginas comenzando por 2
         */
        const pages = _.range(firstIndex, lastIndex + 1).map(page => {
            const index = (page === 1) ? 0 : page;
            const url = utils.getPageUrl(index);
            return url;
        });
        return pages;
    })
}

module.exports = {
    getListOfPagesUrl
}