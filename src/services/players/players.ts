const { getPlayerIdsFromPage } = require("../page");
const { logger, logSeparator } = require("../../tools/logger");
const { useState } = require("../../tools/state");
const { chunk, minToSec } = require("../../tools/utils");
const { countdown } = require("../../tools/request");
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

  return async function requestIds(pageGroup: number[]): Promise<number[]> {
    logSeparator();
    logger.info(`Getting Player Ids`);

    /**
     * Perform multiple request synchronously
     * through a for .. of loop + await-ing every request
     * the result of each request is pushed into the results array
     */
    for (const page of pageGroup) {
      const req = async (id): Promise<number[]> => {
        // Sleep 3 seconds before request
        await countdown(3);
        return await getPlayerIdsFromPage(id);
      };
      try {
        const playerIds = await req(page).then((playerIds) => {
          logger.info(
            `Requested ids (${playerIds.length}): ${playerIds.slice(0, 5)}${
              playerIds.length > 5 && "..."
            }`
          );
          return playerIds;
        });
        results.succeed.push(...playerIds);
      } catch (err) {
        logger.info(`There was an error while fetching player id "${page}"`);
        results.failed.push(page);
      }
    }

    if (results.failed.length) {
      logger.info(`Failed: ${results.failed.length} player Ids. Refetching`);
      // Wait four minutes
      await countdown(REQUEST_TIMEOUT_SECONDS);
      // Recursively call failed ids again
      await requestIds(results.failed);
    }

    logger.info(`All Ids found!`);
    logger.info(`Succeed: ${results.succeed.length} player Ids`);
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
  const groupedPages: number[][] = chunk(20, arrayOfPages);

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
    for (const pageGroup of groupedPages) {
      // Wait a few minutes between each group
      if (count !== 0) await countdown(REQUEST_TIMEOUT_SECONDS);
      const playerIds = await requestIdsFromGroup(pageGroup);
      result.push(...playerIds);
      count = count + 1;
    }
    // sort results in an ascending way
    return result.sort((a, b) => a - b);
  }

  const ids = await requestIds();
  logger.info(`Succeed: ${ids.length} player Ids`);
  return ids;
}
