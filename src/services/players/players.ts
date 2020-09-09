const { getPlayerIdsFromPage } = require("../page");
const { logger, logSeparator } = require("../../tools/logger");
const { useState } = require("../../tools/state");
const { chunk, minToSec } = require("../../tools/utils");
const { sleep, countdown } = require("../../tools/request");
const { REQUEST_TIMEOUT_MINUTES } = require("../../env");

const REQUEST_TIMEOUT_SECONDS = minToSec(REQUEST_TIMEOUT_MINUTES);

interface Result {
  succeed: number[];
  failed: number[];
}

function makeRequestIdsFromGroup() {
  /**
   * Save results in clousure
   */
  let results: Result = {
    succeed: [],
    failed: [],
  };

  return async function requestIds(group: number[]): Promise<number[]> {
    logSeparator();
    logger.info(`Getting Player Ids`);

    /**
     * Perform multiple request synchronously
     * through a for .. of loop + await-ing every request
     * the result of each request is pushed into the results array
     */
    for (const id of group) {
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

    if (results.failed.length) {
      logger.info(`Failed: ${results.failed.length} player Ids. Refetching`);
      // Wait four minutes between each group
      await countdown(REQUEST_TIMEOUT_SECONDS);
      // recursively call failed ids again
      await requestIds(results.failed);
    }

    return results.succeed.sort((a, b) => a - b);
  };
}

/**
 * Create function with clousure Result type inside
 */
const requestIdsFromGroup = makeRequestIdsFromGroup();

/**
 * Crawl a list of all players Ids from all the DataBase
 */
export async function getPlayerIdsByPage(): Promise<number[]> {
  const [state] = useState();
  const { totalPages } = state;
  // const arrayOfPages: number[] = Array.from(Array(totalPages), (_, i) => i + 1);
  const arrayOfPages: number[] = Array.from(Array(40), (_, i) => i + 1);
  const groupedIds: number[][] = chunk(20, arrayOfPages);

  async function requestIds() {
    logSeparator();
    logger.info(`Getting Player Ids`);

    /**
     * Perform multiple request synchronously
     * through a for .. of loop + await-ing every request
     * the result of each request is pushed into the results array
     */
    let result: number[] = [];
    let count = 0;
    for (const group of groupedIds) {
      // Wait a few minutes between each group
      if (count !== 0) await countdown(REQUEST_TIMEOUT_SECONDS);
      const ids = await requestIdsFromGroup(group);
      result.push(...ids);
      count = count + 1;
    }
    return result.sort((a, b) => a - b);
  }

  const ids = await requestIds();
  logger.info(`Succeed: ${ids.length} player Ids`);
  return ids;
}
