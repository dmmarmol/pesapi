const chalk = require("chalk");
const logger = require("pino")({
  prettyPrint: {
    colorize: chalk.supportsColor,
  },
});

function logSeparator() {
  logger.info("==============================");
}

export { logger, logSeparator };
