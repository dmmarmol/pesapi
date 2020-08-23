const chalk = require("chalk");
const logger = require("pino")({
  prettyPrint: {
    colorize: chalk.supportsColor, // --colorize
    // crlf: false, // --crlf
    // errorLikeObjectKeys: ['err', 'error'], // --errorLikeObjectKeys
    // errorProps: '', // --errorProps
    // levelFirst: false, // --levelFirst
    // messageKey: 'msg', // --messageKey
    // levelKey: 'level', // --levelKey
    // messageFormat: false // --messageFormat
    // timestampKey: 'time', // --timestampKey
    // translateTime: false, // --translateTime
    // search: 'foo == `bar`', // --search
    // ignore: 'pid,hostname' // --ignore,
    // customPrettifiers: {}
  },
});

function logSeparator() {
  logger.info("==============================");
}

export { logger, logSeparator };
