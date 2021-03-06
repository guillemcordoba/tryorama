"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const env_1 = require("./env");
const logLevel = env_1.default.logLevel || 'debug';
const myFormat = winston_1.format.printf(({ level, message, label, timestamp }) => label
    ? `${timestamp} [${label}] ${level}: ${message}`
    : `${timestamp} ${level}: ${message}`);
exports.makeLogger = (label, plain) => winston_1.createLogger({
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        verbose: 3,
        debug: 4,
        silly: 5
    },
    format: winston_1.format.combine(winston_1.format.splat(), winston_1.format.colorize(), winston_1.format.timestamp({ format: 'mediumTime' }), winston_1.format.label(label ? { label: plain ? label : `tryorama: ${label}` } : {}), myFormat),
    transports: [
        new winston_1.transports.Console({ level: logLevel })
    ]
});
exports.default = exports.makeLogger('tryorama', true);
//# sourceMappingURL=logger.js.map