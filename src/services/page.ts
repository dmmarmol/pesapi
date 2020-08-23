const { crawl } = require("./request");
const { first, last, compose } = require("../tools/utils");

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

  const maxPlayersNumber = Number(maxPlayersString.match(/\d+/)[0]);
  return maxPlayersNumber;
}
