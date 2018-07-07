require("babel-core");
const path = require("path");
const fs = require('fs');
const config = require("./src/config");
const _ = require('lodash');
const chalk = require('chalk');
const Promise = require('bluebird');
// Custom Modules
const utils = require('./src/utils');
const fetch = require('./src/fetch');
const crawlPlayers = require('./src/crawlPlayers/crawlPlayers');
const crawlPages = require('./src/crawlPages/crawlPages');



async function crawl() {
    try {
        /**
         * 1.
         * Fetch a la primer pagina y devuelvo un array
         * con todas las urls de las paginas
         */
        const pagesUrl = await crawlPages.getListOfPagesUrl();
        /**
         * 2.
         * Crea una promesa por cada `pageUrl` donde se trae la informacion
         * de todos los jugadores de esa pagina
         */
        /* const allPagesRequest =  */
        const playersFromPage = await Promise.mapSeries(pagesUrl, crawlPlayers.getPlayersFromPage)
        /**
         * 3.
         * Luego, debe hacer fetch a cada una de las paginas de cada jugador
         * dentro de esa pagina (2.)
         */
        saveAllPlayers(playersFromPage);


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

function writeFile(data) {
    const fileName = utils.getTimeStamp();
    const version = require("./package.json").version;
    const dir = path.resolve(config.OUTPUT_PATH, `v${version}`, utils.getDirPath());
    const file = path.resolve(dir, `players_${fileName}.json`);

    if (!fs.existsSync(dir)) {
        console.log("======================================");
        utils.log.green(`Creating directory in ${dir}`);
        fs.mkdirSync(dir);
    } else if (fs.existsSync(file)) {
        console.log("======================================");
        utils.log.red(`File ${file} already exist`);
        return;
    }

    console.log("======================================");
    console.log(`Writing file in ${file} with ${data.length} players fetched`);
    fs.writeFileSync(file, JSON.stringify(data), null, 'tab');
}

const saveAllPlayers = async (playersFromPage) => {
    const allplayers = await _.flatten(playersFromPage)
    await writeFile(allplayers);
    console.log('@allplayers', allplayers);
    return;
};

crawl()