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



async function crawlData() {
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
         *
         * Luego, debe hacer fetch a cada una de las paginas de cada jugador
         * dentro de esa pagina (2.)
         */
        const playersFromPage = await Promise.mapSeries(pagesUrl, crawlPlayers.getPlayersFromPage)

        return await playersFromPage;

    } catch (error) {
        console.log(error);
    }

}

function writeFile(data, filePath) {
    utils.log.path('Writing file in', `${filePath} with ${data.length} players fetched`);
    fs.writeFileSync(filePath, JSON.stringify(data), null, "\t");
}

function createDir() {
    const fileName = utils.getTimeStamp();
    const version = require("./package.json").version;
    const dir = `${config.OUTPUT_PATH}${path.sep}v${version}${path.sep}${utils.getDirPath()}`;
    const filePath = path.resolve(dir, `players_${fileName}.json`);

    if (!fs.existsSync(dir)) {
        utils.mkDirByPathSync(dir);
    }

    return filePath;
}

async function start() {
    const filePath = await createDir();
    const data = await crawlData();
    const flattenedData = await _.flatten(data);
    // if (config.DEBUG) {
    //     utils.log.green('Players Crawled');
    //     console.log('@Players', flattenedData);
    //     return;
    // }
    await writeFile(flattenedData, filePath);
}

start();