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
  const arrayOfPages = Array.from(Array(totalPages), (_, i) => i + 1);

  async function requestIds() {
    logSeparator();
    logger.info(`Getting Player Ids`);

    /**
     * Perform multiple request synchronously
     * through a for .. of loop + await-ing every request
     * the result of each request is pushed into the results array
     */
    let results: number[] = [];
    for (let id of arrayOfPages) {
      const req = async (id): Promise<number[]> => {
        // Sleep 3 seconds before request
        await sleep(3000);
        return await getPlayerIdsFromPage(id);
      };
      const playerIds = await req(id).then((playerIds) => {
        logger.info(
          `Requested ids (${playerIds.length}): ${playerIds.slice(0, 5)}...`
        );
        return playerIds;
      });
      results.push(...playerIds);
    }
    return results.sort((a, b) => a - b);
  }

  const ids = await requestIds();
  logger.info(`${ids.length} player Ids found`);
  return ids;
}
