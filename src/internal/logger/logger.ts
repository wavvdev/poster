import winston from "winston";

const LEVEL_COLORS: Record<string, string> = {
  error: "\x1b[31m",   // red
  warn: "\x1b[33m",    // yellow
  info: "\x1b[32m",    // green
  debug: "\x1b[36m",   // cyan
};
const DIM = "\x1b[90m";
const RESET = "\x1b[0m";
const WHITE = "\x1b[37m";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const color = LEVEL_COLORS[level] ?? WHITE;
      const extra = Object.keys(meta).length ? ` ${DIM}${JSON.stringify(meta)}${RESET}` : "";
      return `${DIM}${timestamp}${RESET} ${color}[${level.toUpperCase()}]${RESET} ${WHITE}${message}${RESET}${extra}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
