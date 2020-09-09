import {
  AxiosResponse,
  AxiosError,
  AxiosInstance,
  AxiosInterceptorManager,
} from "axios";
const Axios = require("axios");
const cheerio = require("cheerio");
const { BASE_URL } = require("../env");
const { logger, logSeparator } = require("./logger");
const { identity, minToSec } = require("./utils");

const REQUEST_TIMEOUT_MINUTES = 3.05;
const AxiosInstance: AxiosInstance = Axios.create({
  baseURL: BASE_URL,
  timeout: 3000,
});

const countdown = async (durationInSeconds: number) => {
  let start = Date.now(),
    diff,
    minutes,
    seconds;
  let int;
  const timer = (resolve: () => void) => {
    // get the number of seconds that have elapsed since
    // startTimer() was called
    diff = durationInSeconds - (((Date.now() - start) / 1000) | 0);

    // does the same job as parseInt truncates the float
    minutes = (diff / 60) | 0;
    seconds = diff % 60 | 0;

    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    logger.info(`Next request in: ${minutes}:${seconds}`);

    if (diff <= 0) {
      clearInterval(int);
      resolve();
    }
  };
  return await new Promise((resolve) => {
    // we don't want to wait a full second before the timer starts
    timer(resolve);
    int = setInterval(() => timer(resolve), 1000);
  });
};

const makeErrorHandler = () => {
  let attempt = 0;
  const errorHandler = async function (error: AxiosError) {
    logger.info("ERROR");
    const { response, config } = error;
    if (response.status === 429) {
      logger.info(`Error ${response.status} - ${response.statusText}`);
      logger.info(response.data);
      logger.info(
        `Request Failed was: ${config.baseURL} - ${JSON.stringify(
          config.params
        )}`
      );
      logSeparator();
      const seconds = minToSec(REQUEST_TIMEOUT_MINUTES + attempt / 6);
      await countdown(seconds);
      attempt = attempt + 1;
      console.log(`attempt: ${attempt}`);
      await AxiosInstance.request(config);
      logSeparator();
    }
    // reset the request attempts
    attempt = 0;
    // Do something with response error
    return Promise.reject(error);
  };

  return errorHandler;
};

AxiosInstance.interceptors.response.use(identity, makeErrorHandler());

type Params = { [i: string]: any };

/**
 * Fetch an url and return it's contents
 */
export async function request<T>(
  path?: string,
  params?: Params
): Promise<AxiosResponse<T>> {
  const p = path ? path : "/";
  logSeparator();

  logger.info(
    `Request made to: "${p}" with { params: ${JSON.stringify(params)} }`
  );
  const { data } = await AxiosInstance.get(p, { params });
  logger.info(`Output was: ${JSON.stringify(data).slice(0, 30)}...`);

  // await sleep(1000);
  return data;
}

/**
 * Fetchs an url and returns a cheerio object
 * ready to interact with the dom
 */
export async function crawl(path?: string, params?: Params): Promise<Cheerio> {
  const html = await request(path, params);
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
