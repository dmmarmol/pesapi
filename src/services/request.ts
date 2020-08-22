import { AxiosResponse } from "axios";

const axios = require("axios");
const { AxiosResponse } = require("axios");
const cheerio = require("cheerio");
const { BASE_URL } = require("../env");

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 1000,
});

/**
 * Fetch an url and return it's contents
 */
export async function request<T>(path?: string): Promise<AxiosResponse<T>> {
  const { data } = await instance.get(path);
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
