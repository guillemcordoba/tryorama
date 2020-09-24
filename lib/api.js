"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const fs = require('fs').promises;
const path = require('path');
const TOML = require('@iarna/toml');
const hachiko_1 = require("@holochain/hachiko");
const player_1 = require("./player");
const logger_1 = require("./logger");
const util_1 = require("./util");
const config_1 = require("./config");
const env_1 = require("./env");
const trycp_1 = require("./trycp");
const LOCAL_MACHINE_ID = 'local';
class ScenarioApi {
    constructor(description, orchestratorData, uuid, modifiers = { singleConductor: false }) {
        this.players = (machines, spawnArgs) => __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug('api.players: creating players');
            const configsJson = [];
            const playerBuilders = {};
            for (const machineEndpoint in machines) {
                const trycp = yield this._getClient(machineEndpoint);
                // choose our spwn method based on whether this is a local or remote machine
                const spawnConductor = trycp ? config_1.spawnRemote(trycp, util_1.stripPortFromUrl(machineEndpoint)) : config_1.spawnLocal;
                const configs = machines[machineEndpoint];
                if (trycp) {
                    // keep track of it so we can send a reset() at the end of this scenario
                    this._trycpClients.push(trycp);
                }
                // // if passing an array, convert to an object with keys as stringified indices. Otherwise just get the key, value pairs
                // const entries: Array<[string, AnyConfigBuilder]> = _.isArray(configs)
                //   ? configs.map((v, i) => [String(i), v])
                //   : Object.entries(configs)
                for (const playerName in configs) {
                    const configSeed = configs[playerName];
                    if (!_.isFunction(configSeed)) {
                        throw new Error(`Config for player '${playerName}' contains something other than a function. Either use Config.gen to create a seed function, or supply one manually.`);
                    }
                    const partialConfigSeedArgs = trycp
                        ? yield trycp.setup(playerName)
                        : yield config_1.localConfigSeedArgs();
                    const configSeedArgs = _.assign(partialConfigSeedArgs, {
                        scenarioName: this.description,
                        playerName,
                        uuid: this._uuid
                    });
                    logger_1.default.debug('api.players: seed args generated for %s = %j', playerName, configSeedArgs);
                    const configJson = yield configSeed(configSeedArgs);
                    configsJson.push(configJson);
                    if (!configJson.persistence_dir) {
                        throw new Error("Generated config does not have persistence_dir set");
                    }
                    if (configJson.interfaces[0].driver.type !== 'websocket') {
                        throw new Error("Generated config must contain a single admin websocket interface");
                    }
                    // this code will only be executed once it is determined that all configs are valid
                    playerBuilders[playerName] = () => __awaiter(this, void 0, void 0, function* () {
                        const { instances } = configJson;
                        const configDir = configJson.persistence_dir;
                        const interfacePort = configJson.interfaces[0].driver.port;
                        if (trycp) {
                            const newConfigJson = yield interpolateConfigDnaUrls(trycp, configJson);
                            yield trycp.player(playerName, newConfigJson);
                        }
                        else {
                            yield fs.writeFile(config_1.getConfigPath(configDir), TOML.stringify(configJson));
                        }
                        logger_1.default.debug('api.players: player config committed for %s', playerName);
                        const player = new player_1.Player({
                            name: playerName,
                            config: configJson,
                            configDir,
                            interfacePort,
                            spawnConductor,
                            onJoin: () => instances.forEach(instance => this._waiter.addNode(instance.dna, playerName)),
                            onLeave: () => instances.forEach(instance => this._waiter.removeNode(instance.dna, playerName)),
                            onActivity: () => this._restartTimer(),
                            onSignal: ({ instanceId, signal }) => {
                                const instance = instances.find(c => c.id === instanceId);
                                const dnaId = instance.dna;
                                const observation = {
                                    dna: dnaId,
                                    node: playerName,
                                    signal
                                };
                                this._waiter.handleObservation(observation);
                            },
                        });
                        return player;
                    });
                }
            }
            // this will throw an error if something is wrong
            config_1.assertUniqueTestAgentNames(configsJson);
            logger_1.default.debug('api.players: unique agent name check passed');
            const players = yield util_1.promiseSerialObject(_.mapValues(playerBuilders, c => c()));
            logger_1.default.debug('api.players: players built');
            this._localPlayers = Object.assign(Object.assign({}, this._localPlayers), players);
            // Do auto-spawning if that was requested
            if (spawnArgs) {
                for (const player of Object.values(players)) {
                    logger_1.default.info('api.players: auto-spawning player %s', player.name);
                    yield player.spawn(spawnArgs);
                    logger_1.default.info('api.players: awaiting consistency while spawning player %s', player.name);
                    yield this.consistency();
                    logger_1.default.info('api.players: spawn complete for %s', player.name);
                }
            }
            return players;
        });
        this.consistency = (players) => new Promise((resolve, reject) => {
            if (players) {
                throw new Error("Calling `consistency` with parameters is currently unsupported. See https://github.com/holochain/hachiko/issues/10");
            }
            this._waiter.registerCallback({
                // nodes: players ? players.map(p => p.name) : null,
                nodes: null,
                resolve,
                reject,
            });
        });
        this._getClient = (machineEndpoint) => __awaiter(this, void 0, void 0, function* () {
            if (machineEndpoint === LOCAL_MACHINE_ID) {
                return null;
            }
            else {
                logger_1.default.debug('api.players: establishing trycp client connection to %s', machineEndpoint);
                const trycp = yield trycp_1.trycpSession(machineEndpoint);
                logger_1.default.debug('api.players: trycp client session established for %s', machineEndpoint);
                return trycp;
            }
        });
        this._clearTimer = () => {
            logger_1.default.silly('cleared timer');
            clearTimeout(this._activityTimer);
            this._activityTimer = null;
        };
        this._restartTimer = () => {
            logger_1.default.silly('restarted timer');
            clearTimeout(this._activityTimer);
            this._activityTimer = setTimeout(() => this._destroyLocalConductors(), env_1.default.conductorTimeoutMs);
        };
        this._destroyLocalConductors = () => __awaiter(this, void 0, void 0, function* () {
            const kills = yield this._cleanup('SIGKILL');
            this._clearTimer();
            const names = _.values(this._localPlayers).filter((player, i) => kills[i]).map(player => player.name);
            names.sort();
            const msg = `
The following conductors were forcefully shutdown after ${env_1.default.conductorTimeoutMs / 1000} seconds of no activity:
${names.join(', ')}
`;
            if (env_1.default.strictConductorTimeout) {
                this.fail(msg);
                throw new Error(msg);
            }
            else {
                logger_1.default.error(msg);
            }
        });
        /**
         * Only called externally when there is a test failure,
         * to ensure that players/conductors have been properly cleaned up
         */
        this._cleanup = (signal) => __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug("Calling Api._cleanup. _localPlayers: %j", this._localPlayers);
            const localKills = yield Promise.all(_.values(this._localPlayers).map(player => player.cleanup(signal)));
            yield Promise.all(this._trycpClients.map((trycp) => __awaiter(this, void 0, void 0, function* () {
                yield trycp.reset();
                yield trycp.closeSession();
            })));
            this._clearTimer();
            return localKills;
        });
        this.description = description;
        this.fail = (reason) => { throw new Error(`s.fail: ${reason}`); };
        this._localPlayers = {};
        this._trycpClients = [];
        this._uuid = uuid;
        this._waiter = new hachiko_1.Waiter(hachiko_1.FullSyncNetwork, undefined, orchestratorData.waiterConfig);
        this._modifiers = modifiers;
        this._activityTimer = null;
    }
}
exports.ScenarioApi = ScenarioApi;
/**
 * If URLs are present in the config, use TryCP 'dna' method to instruct the remote machine
 * to download the dna, and then replace the URL in the config with the returned local path
 */
const interpolateConfigDnaUrls = (trycp, configJson) => __awaiter(void 0, void 0, void 0, function* () {
    configJson = _.cloneDeep(configJson);
    configJson.dnas = yield Promise.all(configJson.dnas.map((dna) => __awaiter(void 0, void 0, void 0, function* () {
        if (dna.file.match(/^https?:\/\//)) {
            const { path } = yield trycp.dna(dna.file);
            return _.set(dna, 'file', path);
        }
        else {
            return dna;
        }
    })));
    return configJson;
});
//# sourceMappingURL=api.js.map