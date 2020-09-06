const { crawl } = require("../tools/request");
const { first, last, compose, getNumber } = require("../tools/utils");

export async function getAmountOfPages(): Promise<number> {
  const $ = await crawl();
  const links: Array<CheerioElement> = $(".pages a").toArray();
  const numberOfPages: CheerioElement = compose(
    first,
    (x) => x.children,
    last
  )(links);

  return Number(numberOfPages.data);
}

export async function getTotalPlayers(): Promise<number> {
  const $ = await crawl();
  const links: Array<CheerioElement> = $(".pages span").toArray();
  const maxPlayersString: string = compose(
    (x) => x.data,
    first,
    (x) => x.children,
    last
  )(links);

  const maxPlayersNumber = getNumber(maxPlayersString);
  return maxPlayersNumber;
}

const column = {
  POSITION: 0,
  NAME: 1,
  TEAM_NAME: 2,
  NATIONALITY: 3,
  HEIGHT: 4,
  WEIGHT: 5,
  AGE: 6,
  CONDITION: 7,
  RAITING: 8,
};

export async function getPlayerIdsFromPage(page: number): Promise<number[]> {
  const params = page !== 0 ? { page } : undefined;
  const $ = await crawl("/", params); // ?page=2
  /**
   * Remove first index since <tr>[0] correspond to the table head
   */
  const rows: number[] = $(".players tbody tr")
    .toArray()
    .reduce((acc, tr, index) => {
      if (index === 0) return acc;

      const tds: CheerioElement[] = tr.children;
      const anchor = first(tds[column.NAME].children);
      const id = getNumber(anchor.attribs.href);

      return [...acc, id];
    }, []);
  return rows;
}
