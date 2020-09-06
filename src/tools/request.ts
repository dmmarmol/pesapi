import {
  AxiosResponse,
  AxiosRequestConfig,
  AxiosError,
  AxiosInstance,
} from "axios";
const Axios = require("axios");
const cheerio = require("cheerio");
const { BASE_URL } = require("../env");
const { logger, logSeparator } = require("./logger");
const { identity, compose } = require("./utils");

const REQUEST_TIMEOUT_MINUTES_IN_MS = 60 * 5 * 1000; // 5m
const REQUEST_TIMEOUT_SECONDS = 5; // 5s
const REQUEST_TIMEOUT_MINUTES = 3;
const AxiosInstance: AxiosInstance = Axios.create({
  baseURL: BASE_URL,
  timeout: 3000,
});

function secToMS(seconds: number) {
  return seconds * 1000;
}
function minToSec(minutes: number) {
  return minutes / 60;
}
function msToMin(ms: number) {
  return ms / 60 / 1000;
}
function minToMs(minutes: number) {
  return minutes * 60 * 1000;
}

let lastInvocationTime: number | undefined = undefined;

const scheduler = (config: AxiosRequestConfig) => {
  const now = Date.now();
  if (lastInvocationTime) {
    lastInvocationTime += 2000;
    const waitPeriodForThisRequest = lastInvocationTime - now;
    if (waitPeriodForThisRequest > 0) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(config), waitPeriodForThisRequest);
      });
    }
  }

  lastInvocationTime = now;
  return config;
};

const countdown = (duration: number) => {
  let start = Date.now(),
    diff,
    minutes,
    seconds;
  let int;
  const timer = (resolve: () => void) => {
    // get the number of seconds that have elapsed since
    // startTimer() was called
    diff = duration - (((Date.now() - start) / 1000) | 0);

    // does the same job as parseInt truncates the float
    minutes = (diff / 60) | 0;
    seconds = diff % 60 | 0;

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    logger.info(`Next request in: ${minutes}:${seconds}`);

    if (diff <= 0) {
      clearInterval(int);
      resolve();
    }
  };
  return new Promise((resolve) => {
    // we don't want to wait a full second before the timer starts
    timer(resolve);
    int = setInterval(() => timer(resolve), 1000);
  });
};

const errorHandler = async function (error: AxiosError) {
  logger.info("ERROR");
  console.log(error.response.status);
  if (error.response.status === 429) {
    logger.info(error.response.statusText);
    logger.info(error.response.data);
    logger.info(
      "Request Failed was:",
      error.config.baseURL,
      error.config.params
    );
    const seconds = compose(minToSec, msToMin)(REQUEST_TIMEOUT_MINUTES);
    const miliseconds = minToMs(REQUEST_TIMEOUT_MINUTES);
    await countdown(seconds);
    setTimeout(() => {
      return AxiosInstance.request(error.config);
    }, miliseconds + 100);
    logSeparator();
    // return Promise.resolve(error.request);
    // return Promise.resolve(instance.get(error.request));
    // console.log(typeof error.request);
    // console.log(error.request._header);
    // return Promise.resolve()
  }
  // Do something with response error
  return Promise.reject(error);
};

AxiosInstance.interceptors.request.use(scheduler);
AxiosInstance.interceptors.response.use(identity, errorHandler);

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
    `Request made to: ${p} with { params: ${JSON.stringify(params)} }`
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
