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
const combine_1 = require("./config/combine");
const _ = require("lodash");
/** The no-op middleware */
exports.unit = (run, f) => run(f);
/** Compose two middlewares, typesafe */
exports.compose = (x, y) => (run, f) => {
    return x(g => y(run, g), f);
};
/** Compose 2 middlewares, typesafe. Same as `compose` */
exports.compose2 = exports.compose;
/** Compose 3 middlewares, typesafe */
exports.compose3 = (a, b, c) => exports.compose(exports.compose2(a, b), c);
/** Compose 4 middlewares, typesafe */
exports.compose4 = (a, b, c, d) => exports.compose(exports.compose3(a, b, c), d);
/** Compose 5 middlewares, typesafe */
exports.compose5 = (a, b, c, d, e) => exports.compose(exports.compose4(a, b, c, d), e);
/**
 * Combine multiple middlewares into a single middleware.
 * NOT typesafe, i.e. type info is lost, but convenient.
 * The middlewares are applied in the *reverse order* that they're provided.
 * i.e. the middleware at the end of the chain is the one to act directly on the user-supplied scenario,
 * and the first middleware is the one to provide the clean vanilla scenario that the orchestrator knows how to run
 * So, if using something fancy like `tapeExecutor`, put it at the beginning of the chain.
 */
exports.combine = (...ms) => ms.reduce(exports.compose);
/**
 * Given the `tape` module, tapeExecutor produces a middleware
 * that combines a scenario with a tape test.
 * It registers a tape test with the same description as the scenario itself.
 * Rather than the usual single ScenarioApi parameter, it expands the scenario function
 * signature to also accept tape's `t` object for making assertions
 * If the test throws an error, it registers the error with tape and does not abort
 * the entire test suite.
 *
 * NB: This has had intermittent problems that seemed to fix themselves magically.
 * Tape is a bit brittle when it comes to dynamically specifying tests.
 * Beware...
 *
 * If problems persist, it may be necessary to resolve this promise immediately so that
 * all tape tests can be registered synchronously. Then it is a matter of getting the
 * entire test suite to await the end of all tape tests. It could be done by specifying
 * a parallel vs. serial mode for test running.
 */
exports.tapeExecutor = (tape) => (run, f) => new Promise((resolve, reject) => {
    if (f.length !== 2) {
        reject("tapeExecutor middleware requires scenario functions to take 2 arguments, please check your scenario definitions.");
        return;
    }
    run(s => {
        tape(s.description, t => {
            s.fail = t.fail;
            const p = () => __awaiter(void 0, void 0, void 0, function* () { return yield f(s, t); });
            p()
                .then(() => {
                t.end();
                resolve();
            })
                .catch((err) => {
                // Include stack trace from actual test function, but all on one line.
                // This is the best we can do for now without messing with tape internals
                t.fail(err.stack ? err.stack : err);
                t.end();
                reject(err);
            });
        });
        return Promise.resolve(); // to satisfy the type
    });
});
/**
 * Run tests in series rather than in parallel.
 * Needs to be invoked as a function so types can be inferred at moment of creation.
 */
exports.runSeries = () => {
    let lastPromise = Promise.resolve();
    return (run, f) => __awaiter(void 0, void 0, void 0, function* () {
        lastPromise = lastPromise.then(() => run(f));
        return lastPromise;
    });
};
/**
 * Take all configs defined for all machines and all players,
 * merge the configs into one big TOML file,
 * and create a single player on the local machine to run it.
 * TODO: currently BROKEN.
*/
exports.singleConductor = (run, f) => run((s) => {
    combine_1.unsupportedMergeConfigs('singleConductor middleware');
    const s_ = _.assign({}, s, {
        players: (machineConfigs, ...a) => __awaiter(void 0, void 0, void 0, function* () {
            // throw away machine info, flatten to just all player names
            const playerConfigs = unwrapMachineConfig(machineConfigs);
            const playerNames = _.keys(playerConfigs);
            const combined = combine_1.combineConfigs(machineConfigs);
            const { combined: player } = yield s.players({ local: { combined } }, true);
            const players = playerNames.map(name => {
                const modify = combine_1.adjoin(name);
                const p = {
                    call: (instanceId, ...a) => player.call(modify(instanceId), a[0], a[1], a[2]),
                    info: (instanceId) => player.instance(modify(instanceId)),
                    instance: (instanceId) => player.instance(modify(instanceId)),
                    spawn: () => { throw new Error("player.spawn is disabled by singleConductor middleware"); },
                    kill: () => { throw new Error("player.kill is disabled by singleConductor middleware"); },
                };
                return [name, p];
            });
            return _.fromPairs(players);
        })
    });
    return f(s_);
});
// TODO: add test
exports.callSync = (run, f) => run(s => {
    const s_ = _.assign({}, s, {
        players: (...a) => __awaiter(void 0, void 0, void 0, function* () {
            const players = yield s.players(...a);
            const players_ = _.mapValues(players, api => _.assign(api, {
                callSync: (...b) => __awaiter(void 0, void 0, void 0, function* () {
                    const result = yield api.call(...b);
                    yield s.consistency();
                    return result;
                })
            }));
            return players_;
        })
    });
    return f(s_);
});
// TODO: add test
exports.dumbWaiter = interval => (run, f) => run(s => f(Object.assign({}, s, {
    consistency: () => new Promise(resolve => {
        console.log(`dumbWaiter is waiting ${interval}ms...`);
        setTimeout(resolve, interval);
    })
})));
/**
 * Allow a test to skip the level of machine configuration
 * This middleware wraps the player configs in the "local" machine
 */
exports.localOnly = (run, f) => run(s => {
    const s_ = _.assign({}, s, {
        players: (configs, ...a) => s.players({ local: configs }, ...a)
    });
    return f(s_);
});
/**
 * Allow a test to skip the level of machine configuration
 * This middleware finds a new machine for each N players, and returns the
 * properly wrapped config specifying the acquired machine endpoints
 */
exports.groupPlayersByMachine = (trycpEndpoints, playersPer) => (run, f) => run(s => {
    let urlIndex = 0;
    const s_ = _.assign({}, s, {
        players: (configs, ...a) => __awaiter(void 0, void 0, void 0, function* () {
            const numConfigs = _.keys(configs).length;
            if (numConfigs > trycpEndpoints.length * playersPer) {
                throw new Error(`Error while applying groupPlayersByMachine middleware: Can't fit ${numConfigs} conductors on ${trycpEndpoints.length} machines in groups of ${playersPer}!`);
            }
            const machines = {};
            for (const e of _.range(0, trycpEndpoints.length)) {
                const endpoint = trycpEndpoints[e];
                const machine = {};
                let config;
                for (const p of _.range(0, playersPer)) {
                    const index = String(e * playersPer + p);
                    config = configs[index];
                    if (!config) {
                        break;
                    }
                    machine[index] = config;
                }
                if (!_.isEmpty(machine)) {
                    machines[endpoint] = machine;
                }
                if (!config) {
                    break;
                }
            }
            return s.players(machines, ...a);
        })
    });
    return f(s_);
});
/**
 * Allow a test to skip the level of machine configuration
 * This middleware finds a new machine for each player, and returns the
 * properly wrapped config specifying the acquired machine endpoints
 */
exports.machinePerPlayer = (endpoints) => exports.groupPlayersByMachine(endpoints, 1);
const unwrapMachineConfig = (machineConfigs) => _.chain(machineConfigs)
    .values()
    .map(_.toPairs)
    .flatten()
    .fromPairs()
    .value();
//# sourceMappingURL=middleware.js.map