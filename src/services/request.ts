import { AxiosResponse } from "axios";
const axios = require("axios");
const cheerio = require("cheerio");
const { BASE_URL } = require("../env");
const { logger, logSeparator } = require("../tools/logger");

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 3000,
});

/**
 * Fetch an url and return it's contents
 */
export async function request<T>(path?: string): Promise<AxiosResponse<T>> {
  logSeparator();
  if (!path) logger.info(`Request made to: "/"`);
  else logger.info(`Request made to: ${path}`);

  const { data } = await instance.get(path);

  if (!path) logger.info(`Output from: "/" exist? ${Boolean(data)}`);
  else logger.info(`Output from: ${path} exist? ${Boolean(data)}`);

  await sleep(1000);
  return data;
}

/**
 * Fetchs an url and returns a cheerio object
 * ready to interact with the dom
 */
export async function crawl(path?: string): Promise<Cheerio> {
  const html = await request(path);
  const $: Cheerio = cheerio.load(html);
  return $;
}

/**
 * Deelay next call
 */
export async function sleep(ms: number) {
  logger.info(`Sleeping for ${ms}ms`);
  return function (response) {
    return new Promise((resolve) => setTimeout(() => resolve(response), ms));
  };
}
