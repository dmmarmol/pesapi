require("babel-core");
const path = require("path");
const fs = require("fs");
const config = require("./config");
const _ = require("lodash");
const chalk = require("chalk");
const Promise = require("bluebird");
// Custom Modules
const utils = require("./utils");
const fetch = require("./fetch");
const crawlPlayers = require("./crawlPlayers/crawlPlayers");
const crawlPages = require("./crawlPages/crawlPages");

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
    const playersFromPage = await Promise.mapSeries(
      pagesUrl,
      crawlPlayers.getPlayersFromPage
    );

    return await playersFromPage;
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

function writeFile(data, filePath) {
  utils.log.path(
    "Writing file in",
    `${filePath} with ${data.length} players fetched`
  );
  fs.writeFileSync(filePath, JSON.stringify(data), null, "\t");
}

async function createDir() {
  const fileName = utils.getTimeStamp();
  const version = require("../package.json").version;
  const dir = `${config.OUTPUT_PATH}${path.sep}v${version}${
    path.sep
  }${utils.getDirPath()}`;
  const filePath = path.resolve(dir, `players_${fileName}.json`);

  // fs.mkdirSync(dir);
  if (!fs.existsSync(dir)) {
    utils.mkDirByPathSync(dir);
    // Error(`dir ${dir} couldn't be created`)
  }

  return filePath;
}

async function start() {
  const filePath = await createDir();
  const data = await crawlData();
  const flattenedData = await _.flatten(data);
  if (config.DEBUG) {
    utils.log.green("Players Crawled");
    // flattenedData.forEach(player => console.log(player.playerName));
    console.log("@Players", flattenedData);
    return;
  }
  await writeFile(flattenedData, filePath);
}

start();
