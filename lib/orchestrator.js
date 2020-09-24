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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuidGen = require('uuid/v4');
const _ = __importStar(require("lodash"));
const M = __importStar(require("./middleware"));
const R = __importStar(require("./reporter"));
const logger_1 = __importDefault(require("./logger"));
const api_1 = require("./api");
const defaultModeOpts = {
    executor: { tape: require('tape') },
    spawning: 'local',
};
const modeToMiddleware = (mode) => {
    const executor = (mode.executor === 'none')
        ? M.runSeries()
        : mode.executor === 'tape'
            ? M.tapeExecutor(require('tape'))
            : M.tapeExecutor(mode.executor.tape);
    return M.compose(executor, M.localOnly);
};
class Orchestrator {
    constructor(o = {}) {
        this.numRegistered = () => this._scenarios.length;
        this.run = () => __awaiter(this, void 0, void 0, function* () {
            const allTests = this._scenarios;
            const onlyTests = allTests.filter(({ modifier }) => modifier === 'only');
            const tests = onlyTests.length > 0
                ? onlyTests
                : allTests.filter(({ modifier }) => modifier !== 'skip');
            this._reporter.before(tests.length);
            logger_1.default.debug("About to execute %d tests", tests.length);
            if (onlyTests.length > 0) {
                logger_1.default.warn(`.only was invoked; only running ${onlyTests.length} test(s)!`);
            }
            if (tests.length < allTests.length) {
                logger_1.default.warn(`Skipping ${allTests.length - tests.length} test(s)!`);
            }
            return this._executeParallel(tests);
        });
        this._executeParallel = (tests) => __awaiter(this, void 0, void 0, function* () {
            let successes = 0;
            const errors = [];
            const all = tests.map(({ api, desc, execute }) => {
                return { api, desc, promise: execute() };
            }).map(({ api, desc, promise }) => {
                return promise
                    .then(() => {
                    console.debug('success for ', desc);
                    successes += 1;
                })
                    .catch(e => {
                    console.error(`got an error for test '${desc}':`, e);
                    errors.push({ description: desc, error: e });
                })
                    .then(() => {
                    logger_1.default.debug("Done with test: %s", desc);
                    return api._cleanup();
                })
                    .then(() => {
                    logger_1.default.debug("Done with _cleanup");
                });
            });
            yield Promise.all(all);
            const stats = { successes, errors };
            this._reporter.after(stats);
            return stats;
        });
        // Unnecessary if indeed the callSerial middleware works as well
        // as it should:
        //
        // _executeSeries = async (tests: Array<RegisteredScenario>) => {
        //   let successes = 0
        //   const errors: Array<TestError> = []
        //   for (const { api, desc, execute } of tests) {
        //     this._reporter.each(desc)
        //     try {
        //       logger.debug("Executing test: %s", desc)
        //       await execute()
        //       logger.debug("Test succeeded: %s", desc)
        //       successes += 1
        //     } catch (e) {
        //       logger.debug("Test failed: %s %o", desc, e)
        //       errors.push({ description: desc, error: e })
        //     } finally {
        //       logger.debug("Cleaning up test: %s", desc)
        //       await api._cleanup()
        //       logger.debug("Finished with test: %s", desc)
        //     }
        //   }
        //   const stats = {
        //     successes,
        //     errors
        //   }
        //   this._reporter.after(stats)
        //   return stats
        // }
        this._registerScenario = (desc, scenario, modifier) => {
            const orchestratorData = _.pick(this, [
                '_globalConfig',
                'waiterConfig',
            ]);
            const api = new api_1.ScenarioApi(desc, orchestratorData, uuidGen());
            const runner = (scenario) => __awaiter(this, void 0, void 0, function* () { return scenario(api); });
            const execute = () => this._middleware(runner, scenario);
            this._scenarios.push({ api, desc, execute, modifier });
        };
        if (o.mode && o.middleware) {
            throw new Error("Cannot set both `mode` and `middleware` in the orchestrator params. Pick one or the others.");
        }
        this._middleware = o.middleware || modeToMiddleware(o.mode || defaultModeOpts);
        this._scenarios = [];
        this._reporter = o.reporter === true
            ? R.basic(x => console.log(x))
            : o.reporter || R.unit;
        this.waiterConfig = o.waiter;
        const registerScenario = (desc, scenario) => this._registerScenario(desc, scenario, null);
        const registerScenarioOnly = (desc, scenario) => this._registerScenario(desc, scenario, 'only');
        const registerScenarioSkip = (desc, scenario) => this._registerScenario(desc, scenario, 'skip');
        this.registerScenario = Object.assign(registerScenario, {
            only: registerScenarioOnly,
            skip: registerScenarioSkip,
        });
    }
}
exports.Orchestrator = Orchestrator;
//# sourceMappingURL=orchestrator.js.map