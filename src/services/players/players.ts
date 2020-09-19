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

type PlayerIdsByPage = { [i: number]: number[] };

const requestPlayerByPage = async (id): Promise<number[]> => {
  // Sleep 3 seconds before request
  await countdown(3);
  return await getPlayerIdsFromPage(id);
};

function makeRequestIdsFromGroup() {
  /**
   * Save results in clousure
   */
  let playerIdsByPage: PlayerIdsByPage = {};

  return async function requestIds(
    pageGroup: number[]
  ): Promise<PlayerIdsByPage> {
    logSeparator();
    logger.info(`Getting Player Ids`);

    /**
     * Perform multiple request synchronously
     * through a for .. of loop + await-ing every request
     * the result of each request is pushed into the results array
     */
    for (const page of pageGroup) {
      playerIdsByPage[page] = [];

      try {
        const playerIds = await requestPlayerByPage(page);
        logger.info(
          `Requested ids (${playerIds.length}): ${playerIds.slice(0, 5)}${
            playerIds.length > 5 && "..."
          }`
        );
        playerIdsByPage[page] = playerIds;
      } catch (err) {
        logger.info(
          `There was an error while fetching player id "${page}". Refetching`
        );
        // Wait four minutes
        // await countdown(REQUEST_TIMEOUT_SECONDS);
        // Recursively call failed ids again
        await requestIds([page]);
      }
    }

    logger.info(`All Ids found!`);
    logger.info(`Succeed: ${Object.values(playerIdsByPage).length} player Ids`);
    return Object.keys(playerIdsByPage).reduce((acc, page) => {
      // Sort PlayerIds ASC
      return { ...acc, [page]: playerIdsByPage[page].sort((a, b) => a - b) };
    }, {});
  };
}

/**
 * Create function with clousure Result type inside
 */
const requestIdsFromGroup = makeRequestIdsFromGroup();

/**
 * Crawl a list of all players Ids from all the DataBase
 */
export async function getPlayerIdsByPage(): Promise<PlayerIdsByPage> {
  const [state] = useState();
  const { totalPages } = state;
  // const arrayOfPages: number[] = Array.from(Array(totalPages), (_, i) => i + 1);
  const arrayOfPages: number[] = Array.from(Array(5), (_, i) => i + 1);
  const groupedPages: number[][] = chunk(20, arrayOfPages);

  async function requestIds() {
    logSeparator();
    logger.info(`Getting Player Ids`);

    /**
     * Perform multiple request synchronously
     * through a for .. of loop + await-ing every request
     * the result of each request is pushed into the results array
     */
    let result: PlayerIdsByPage = {};
    let count = 0;
    for (const pageGroup of groupedPages) {
      // Wait a few minutes between each group
      if (count !== 0) await countdown(REQUEST_TIMEOUT_SECONDS);
      const playerIdsByPage = await requestIdsFromGroup(pageGroup);
      console.log("playerIdsByPage", playerIdsByPage);
      result = { ...result, ...playerIdsByPage };
      count = count + 1;
    }
    // sort results in an ascending way
    return result;
  }

  const idsByPage = await requestIds();
  logger.info(`Succeed: ${Object.values(idsByPage).length} player Ids`);
  return idsByPage;
}
