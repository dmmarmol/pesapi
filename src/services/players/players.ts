const { getPlayerIdsFromPage } = require("../page");
const { logger, logSeparator } = require("../../tools/logger");
const { useState } = require("../../tools/state");
const { sleep } = require("../../tools/request");

/**
 * Crawl a list of all players Ids from all the DataBase
 */
export async function getAllPlayerIds(): Promise<number[]> {
  const [state] = useState();
  const { totalPages } = state;
  //   const arrayOfPages = Array.from(Array(totalPages), (_, i) => i + 1);
  const arrayOfPages = Array.from(Array(100), (_, i) => i + 1);

  async function requestIds() {
    logSeparator();
    logger.info(`Getting Player Ids`);
    // const promises = arrayOfPages.reduce((acc, curr) => {
    //   const req = async (n) => {
    //     return await getPlayerIdsFromPage(n);
    //   };

    //   return [...acc, req(curr)];
    // }, []);
    // const ids = await Promise.all(promises);
    // return ids.flat(Infinity);

    let results: number[] = [];
    for (let id of arrayOfPages) {
      const req = async (id): Promise<number> => await getPlayerIdsFromPage(id);
      const playerIds = await req(id).then((playerIds) => {
        logger.info(`Requested ids: ${playerIds}`);
        return playerIds;
      });
      results.push(playerIds);
    }
    return results.flat(Infinity).sort((a, b) => a - b);
  }

  const ids = await requestIds();
  logger.info(`${ids.length} player Ids found`);
  return ids;
}
