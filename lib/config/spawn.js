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
const child_process_1 = require("child_process");
const logger_1 = require("../logger");
const conductor_1 = require("../conductor");
const _1 = require(".");
const env_1 = require("../env");
exports.spawnTest = (player, {}) => __awaiter(void 0, void 0, void 0, function* () {
    return new conductor_1.Conductor({
        name: 'test-conductor',
        kill: () => __awaiter(void 0, void 0, void 0, function* () { }),
        onSignal: () => { },
        onActivity: () => { },
        interfaceWsUrl: '',
    });
});
exports.spawnLocal = (player, { handleHook } = {}) => __awaiter(void 0, void 0, void 0, function* () {
    const name = player.name;
    const configPath = _1.getConfigPath(player._configDir);
    let handle;
    try {
        const binPath = process.env.TRYORAMA_HOLOCHAIN_PATH || 'holochain';
        const version = child_process_1.execSync(`${binPath} --version`);
        logger_1.default.info("Using conductor path: %s", binPath);
        logger_1.default.info("Holochain version: %s", version);
        handle = child_process_1.spawn(binPath, ['-c', configPath], {
            env: Object.assign({ "N3H_QUIET": "1", "RUST_BACKTRACE": "1" }, process.env)
        });
        let plainLogger = logger_1.makeLogger();
        handle.stdout.on('data', data => plainLogger.info(getFancy(`[[[CONDUCTOR ${name}]]]\n${data.toString('utf8')}`)));
        handle.stderr.on('data', data => plainLogger.info(getFancy(`{{{CONDUCTOR ${name}}}}\n${data.toString('utf8')}`)));
        if (handleHook) {
            // TODO: document this
            player.logger.info('running spawned handle hack.');
            handleHook(handle);
        }
        const newPort = yield getTrueInterfacePort(handle, player.name);
        if (newPort) {
            player._interfacePort = newPort;
        }
        const conductor = new conductor_1.Conductor({
            name,
            kill: (...args) => __awaiter(void 0, void 0, void 0, function* () { return handle.kill(...args); }),
            onSignal: player.onSignal.bind(player),
            onActivity: player.onActivity,
            interfaceWsUrl: `ws://localhost:${player._interfacePort}`,
        });
        return conductor;
    }
    catch (err) {
        return Promise.reject(err);
    }
});
const getTrueInterfacePort = (handle, name) => {
    // This is a magic string output by the conductor when using the "choose_free_port"
    // Interface conductor config, to alert the client as to which port the interface chose.
    // This check only happens in tryorama once, whenever the conductor is spawned.
    //
    // # NB: HOWEVER, if tryorama ever calls an admin function which causes the interface to
    // restart, this port will change, and tryorama will not know about it!!
    // If we ever do something like that, we'll have to constantly monitor stdout
    // and update the interface port accordingly
    let portPattern = new RegExp(`\\*\\*\\* Bound interface '${env_1.default.interfaceId}' to port: (\\d+)`);
    return new Promise((fulfill, reject) => {
        let resolved = false;
        handle.on('close', code => {
            resolved = true;
            logger_1.default.info(`conductor '${name}' exited with code ${code}`);
            // this rejection will have no effect if the promise already resolved,
            // which happens below
            reject(`Conductor exited before starting interface (code ${code})`);
        });
        handle.stdout.on('data', data => {
            if (resolved) {
                return;
            }
            // wait for the logs to convey that the interfaces have started
            // because the consumer of this function needs those interfaces
            // to be started so that it can initiate, and form,
            // the websocket connections
            const line = data.toString('utf8');
            const match = line.match(portPattern);
            if (match && match.length >= 2) {
                // If we find the magic string that identifies the correct port, let's use that
                const port = match[1];
                logger_1.default.info(`Conductor '${name}' process spawning successful. Interface port detected: ${port}`);
                logger_1.default.debug(`(stdout line parsed: ${line})`);
                resolved = true;
                fulfill(port);
            }
            else if (line.indexOf("Done. All interfaces started.") >= 0) {
                // If we don't see the magic string, we'll see this line first instead
                logger_1.default.info(`Conductor '${name}' process spawning successful. No interface port detected.`);
                logger_1.default.debug(`(stdout line parsed: ${line})`);
                resolved = true;
                fulfill(null);
            }
        });
    });
};
exports.spawnRemote = (trycp, machineUrl) => (player) => __awaiter(void 0, void 0, void 0, function* () {
    const name = player.name;
    const spawnResult = yield trycp.spawn(name);
    logger_1.default.debug(`TryCP spawn result: ${spawnResult}`);
    // NB: trycp currently blocks until conductor is ready. It would be nice if it instead sent a notification asynchronously when the conductor is ready.
    // logger.info('Waiting 20 seconds for remote conductor to be ready to receive websocket connections...')
    // await delay(20000)
    // logger.info('Done waiting. Ready or not, here we come, remote conductor!')
    return new conductor_1.Conductor({
        name,
        kill: (signal) => trycp.kill(name, signal),
        onSignal: player.onSignal.bind(player),
        onActivity: player.onActivity,
        interfaceWsUrl: `${machineUrl}:${player._interfacePort}`,
    });
});
const bullets = "☉★☯☸☮";
let currentBullet = 0;
const getFancy = (output) => {
    const bullet = bullets[currentBullet];
    currentBullet = (currentBullet + 1) % bullets.length;
    const indented = output.split('\n').join(`\n${bullet} `);
    return `\n${bullet}${bullet}${bullet} ${indented}`;
};
/**
 * Only spawn one conductor per "name", to be used for entire test suite
 * Unused.
 * TODO: disable `.kill()` and `.spawn()` in scenario API
 */
const memoizedSpawner = () => {
    const memomap = {};
    return (player, args) => {
        const name = player.name;
        if (!(name in memomap)) {
            memomap[name] = exports.spawnLocal(player, args);
        }
        return memomap[name];
    };
};
//# sourceMappingURL=spawn.js.map