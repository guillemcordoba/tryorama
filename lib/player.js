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
const logger_1 = require("./logger");
const get_port_cautiously_1 = require("./config/get-port-cautiously");
const util_1 = require("./util");
const common_1 = require("./common");
const fs = require('fs').promises;
/**
 * Representation of a Conductor user.
 * A Player is essentially a wrapper around a conductor config that was generated,
 * and the possible reference to a conductor which is running based on that config.
 * The Player can spawn or kill a conductor based on the generated config.
 * Players are the main interface for writing scenarios.
 */
class Player {
    constructor({ name, config, configDir, adminInterfacePort, appInterfacePort, onJoin, onLeave, onSignal, onActivity, spawnConductor }) {
        this.admin = () => {
            if (this._conductor) {
                return this._conductor.adminClient;
            }
            else {
                throw new Error("Conductor is not spawned: admin interface unavailable");
            }
        };
        this.call = (...args) => __awaiter(this, void 0, void 0, function* () {
            if (args.length === 4) {
                const [cellNick, zome_name, fn_name, payload] = args;
                const cell_id = this._cellIds[cellNick];
                if (!cell_id) {
                    throw new Error("Unknown cell nick: " + cellNick);
                }
                const [_dnaHash, provenance] = cell_id;
                return this.call({
                    cap: common_1.fakeCapSecret(),
                    cell_id,
                    zome_name,
                    fn_name,
                    payload,
                    provenance,
                });
            }
            else if (args.length === 1) {
                this._conductorGuard(`call(${JSON.stringify(args[0])})`);
                return this._conductor.appClient.callZome(args[0]);
            }
            else {
                throw new Error("Must use either 1 or 4 arguments with `player.call`");
            }
        });
        this.cellId = (nick) => {
            const cellId = this._cellIds[nick];
            if (!cellId) {
                throw new Error(`Unknown cell nickname: ${nick}`);
            }
            return cellId;
        };
        this.stateDump = (nick) => __awaiter(this, void 0, void 0, function* () {
            return this.admin().dumpState({
                cell_id: this.cellId(nick)
            });
        });
        /**
         * Get a particular Instance of this conductor.
         * The reason for supplying a getter rather than allowing direct access to the collection
         * of instances is to allow middlewares to modify the instanceId being retrieved,
         * especially for singleConductor middleware
         */
        this.instance = (instanceId) => {
            this._conductorGuard(`instance(${instanceId})`);
            util_1.unimplemented("Player.instance");
            // return _.cloneDeep(this._instances[instanceId])
        };
        this.instances = (filterPredicate) => {
            util_1.unimplemented("Player.instances");
            return [];
            // return _.flow(_.values, _.filter(filterPredicate), _.cloneDeep)(this._instances)
        };
        /**
         * Spawn can take a function as an argument, which allows the caller
         * to do something with the child process handle, even before the conductor
         * has fully started up. Otherwise, by default, you will have to wait for
         * the proper output to be seen before this promise resolves.
         */
        this.spawn = (spawnArgs) => __awaiter(this, void 0, void 0, function* () {
            if (this._conductor) {
                this.logger.warn(`Attempted to spawn conductor '${this.name}' twice!`);
                return;
            }
            yield this.onJoin();
            this.logger.debug("spawning");
            const conductor = yield this._spawnConductor(this, spawnArgs);
            this.logger.debug("spawned");
            this._conductor = conductor;
            this.logger.debug("initializing");
            yield this._conductor.initialize();
            yield this._setCellNicks();
            this.logger.debug("initialized");
        });
        this.kill = (signal = 'SIGINT') => __awaiter(this, void 0, void 0, function* () {
            if (this._conductor) {
                const c = this._conductor;
                this._conductor = null;
                this.logger.debug("Killing...");
                yield c.kill(signal);
                this.logger.debug("Killed.");
                yield this.onLeave();
                return true;
            }
            else {
                this.logger.warn(`Attempted to kill conductor '${this.name}' twice`);
                return false;
            }
        });
        /** Runs at the end of a test run */
        this.cleanup = (signal = 'SIGINT') => __awaiter(this, void 0, void 0, function* () {
            this.logger.debug("calling Player.cleanup, conductor: %b", this._conductor);
            if (this._conductor) {
                yield this.kill(signal);
                get_port_cautiously_1.unparkPort(this._adminInterfacePort);
                get_port_cautiously_1.unparkPort(this._appInterfacePort);
                return true;
            }
            else {
                get_port_cautiously_1.unparkPort(this._adminInterfacePort);
                get_port_cautiously_1.unparkPort(this._appInterfacePort);
                return false;
            }
        });
        this._setCellNicks = () => __awaiter(this, void 0, void 0, function* () {
            const { cell_data } = yield this._conductor.appClient.appInfo({ app_id: 'LEGACY' });
            for (const [cellId, cellNick] of cell_data) {
                this._cellIds[cellNick] = cellId;
            }
        });
        this._conductorGuard = (context) => {
            if (this._conductor === null) {
                const msg = `Attempted conductor action when no conductor is running! You must \`.spawn()\` first.\nAction: ${context}`;
                this.logger.error(msg);
                throw new Error(msg);
            }
            else {
                this.logger.debug(context);
            }
        };
        this.name = name;
        this.logger = logger_1.makeLogger(`player ${name}`);
        this.onJoin = onJoin;
        this.onLeave = onLeave;
        this.onSignal = onSignal;
        this.onActivity = onActivity;
        this.config = config;
        this._conductor = null;
        this._cellIds = {};
        this._configDir = configDir;
        this._adminInterfacePort = adminInterfacePort;
        this._appInterfacePort = appInterfacePort;
        this._spawnConductor = spawnConductor;
    }
}
exports.Player = Player;
//# sourceMappingURL=player.js.map