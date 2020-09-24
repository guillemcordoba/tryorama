"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const builder_1 = require("./config/builder");
exports.Config = builder_1.default;
var orchestrator_1 = require("./orchestrator");
exports.Orchestrator = orchestrator_1.Orchestrator;
var player_1 = require("./player");
exports.Player = player_1.Player;
var instance_1 = require("./instance");
exports.Instance = instance_1.Instance;
__export(require("./middleware"));
__export(require("./types"));
const logger_1 = require("./logger");
const env_1 = require("./env");
logger_1.default.info("Using the following settings from environment variables:");
logger_1.default.info(JSON.stringify(env_1.default, null, 2));
//# sourceMappingURL=index.js.map