require("babel-core");
const path = require("path");
const config = require("./src/config");
const _ = require('lodash');
const chalk = require('chalk');
const Promise = require('bluebird');
// Custom Modules
const utils = require('./src/utils');
const fetch = require('./src/fetch');
const crawlPlayers = require('./src/crawlPlayers/crawlPlayers');
const crawlPages = require('./src/crawlPages/crawlPages');



async function go() {
    try {
        /**
         * 1.
         * Fetch a la primer pagina y devuelvo un array
         * con todas las urls de las paginas
         */
        const pagesUrl = await crawlPages.getListOfPagesUrl();
        // console.log('@pagesUrl', pagesUrl);
        /**
         * 2.
         * Crea una promesa por cada `pageUrl` donde se trae la informacion
         * de todos los jugadores de esa pagina
         */
        /* const allPagesRequest =  */
        // await Promise.mapSeries(pagesUrl, crawlPlayers.getPlayersFromPage)
        const playersFromPage = await Promise.mapSeries(pagesUrl, crawlPlayers.getPlayersFromPage)
        /**
         * 3.
         * Luego, debe hacer fetch a cada una de las paginas de cada jugador
         * dentro de esa pagina (2.)
         */
        // .then(response => {
        //     // console.log('@allPagesRequest', _.flatten(response));
        //     return _.flatten(response);
        // });
        const Allplayers = _.flatten(playersFromPage);
        console.log('@Allplayers', Allplayers);
        // await Promise.all(allPagesRequest).then(
        //     response => {
        //         utils.log.green('@then');
        //         console.log(response)
        //     }
        // );


        // const players1 = await crawlPlayers.getPlayerIds(url);
        // console.log('@await done #1', players1);


        // console.log('@await done #2', pages);
        // const players2 = await crawlPlayers.getBasicPlayer(2);
        // console.log('@await done #2', players2);
        // const players3 = await crawlPlayers.getBasicPlayer(3);
        // console.log('@await done #3', players3);
        // const players236 = await crawlPlayers.getBasicPlayer(236);
        // console.log('@await done #236', players236);
    } catch (error) {
        console.log(error);
    }
}

go();