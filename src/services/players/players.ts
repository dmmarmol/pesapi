const { getPlayerIdsFromPage } = require("../page");
const { logger, logSeparator } = require("../../tools/logger");
const { useState } = require("../../tools/state");
const { compose, chunk } = require("../../tools/utils");
const { sleep, countdown } = require("../../tools/request");

interface Result {
  succeed: number[];
  failed: number[];
}

function makeGroupsOfIds(ids: string[]) {
  return chunk(5, ids);
}

/**
 * Crawl a list of all players Ids from all the DataBase
 */
export async function getAllPlayerIds(): Promise<Result> {
  const [state] = useState();
  const { totalPages } = state;
  const arrayOfPages: number[] = Array.from(Array(totalPages), (_, i) => i + 1);

  async function requestIds(): Promise<Result> {
    logSeparator();
    logger.info(`Getting Player Ids`);

    /**
     * Perform multiple request synchronously
     * through a for .. of loop + await-ing every request
     * the result of each request is pushed into the results array
     */
    let results: Result = {
      succeed: [],
      failed: [],
    };
    for (const id of arrayOfPages) {
      const req = async (id): Promise<number[]> => {
        // Sleep 3 seconds before request
        await sleep(3000);
        return await getPlayerIdsFromPage(id);
      };
      try {
        const playerIds = await req(id).then((playerIds) => {
          logger.info(
            `Requested ids (${playerIds.length}): ${playerIds.slice(0, 5)}...`
          );
          return playerIds;
        });
        results.succeed.push(...playerIds);
      } catch (err) {
        logger.info(`There was an error while fetching player id "${id}"`);
        results.failed.push(id);
      }
    }
    return {
      succeed: results.succeed.sort((a, b) => a - b),
      failed: results.failed.sort((a, b) => a - b),
    };
  }

  const ids = await requestIds();
  logger.info(`Succeed: ${ids.succeed.length} player Ids`);
  logger.info(`Failed: ${ids.failed.length} player Ids`);
  return ids;
}
