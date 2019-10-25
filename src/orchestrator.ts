const _ = require('lodash')
const uuidGen = require('uuid/v4')

import * as T from "./types";
import * as M from "./middleware";
import * as R from "./reporter";
import { WaiterOptions } from "@holochain/hachiko";
import logger from "./logger";
import { ScenarioApi } from "./api";

export const defaultGlobalConfig: T.GlobalConfig = {
  network: 'memory',
  logger: false,
}

type OrchestratorConstructorParams = {
  reporter?: boolean | R.Reporter,
  middleware?: M.Middleware,
  globalConfig?: T.GlobalConfigPartial,
  waiter?: WaiterOptions,
  newConfig?: any,  // TODO give type, maybe flatten into overall config
}

type MakeGenConfigArgsFn = (playerName: string, uuid: string) => Promise<T.ConfigSeedArgs>

type ScenarioModifier = 'only' | 'skip' | null
type RegisteredScenario = {
  api: ScenarioApi,
  desc: string,
  execute: ScenarioExecutor,
  modifier: ScenarioModifier,
}
type Register = (desc: string, scenario: Function) => void

export type TestStats = {
  successes: number,
  errors: Array<TestError>,
}
type TestError = { description: string, error: any }

type ScenarioExecutor = () => Promise<void>

export class Orchestrator {

  registerScenario: Register & { only: Register, skip: Register }
  waiterConfig?: WaiterOptions

  _middleware: M.Middleware
  _globalConfig: T.GlobalConfig
  _scenarios: Array<RegisteredScenario>
  _reporter: R.Reporter

  constructor(o: OrchestratorConstructorParams = {}) {
    this._middleware = o.middleware || M.runSeries
    this._globalConfig = _.merge(defaultGlobalConfig, o.globalConfig || {})
    this._scenarios = []
    this._reporter = o.reporter === true
      ? R.basic(x => console.log(x))
      : o.reporter || R.unit
    this.waiterConfig = o.waiter

    const registerScenario = (desc, scenario) => this._registerScenario(desc, scenario, null)
    const registerScenarioOnly = (desc, scenario) => this._registerScenario(desc, scenario, 'only')
    const registerScenarioSkip = (desc, scenario) => this._registerScenario(desc, scenario, 'skip')
    this.registerScenario = Object.assign(registerScenario, {
      only: registerScenarioOnly,
      skip: registerScenarioSkip,
    })
  }

  numRegistered = () => this._scenarios.length

  run = async (): Promise<TestStats> => {
    const allTests = this._scenarios
    const onlyTests = allTests.filter(({ modifier }) => modifier === 'only')
    const tests = onlyTests.length > 0
      ? onlyTests
      : allTests.filter(({ modifier }) => modifier !== 'skip')

    this._reporter.before(tests.length)

    logger.debug("About to execute %d tests", tests.length)
    if (onlyTests.length > 0) {
      logger.warn(`.only was invoked; only running ${onlyTests.length} test(s)!`)
    }
    if (tests.length < allTests.length) {
      logger.warn(`Skipping ${allTests.length - tests.length} test(s)!`)
    }
    return this._executeParallel(tests)
  }

  _executeParallel = async (tests: Array<RegisteredScenario>) => {
    let successes = 0
    const errors: Array<TestError> = []
    const all = tests.map(({ api, desc, execute }) => {
      return { api, desc, promise: execute() }
    }).map(({ api, desc, promise }) => {
      return promise
        .then(() => {
          console.debug('success for ', desc)
          successes += 1
        })
        .catch(e => {
          console.error("got an error for ", desc, e)
          errors.push({ description: desc, error: e })
        })
        .then(() => {
          logger.debug("Done with test: %s", desc)
          return api._cleanup()
        })
    })
    await Promise.all(all)

    const stats = { successes, errors }
    this._reporter.after(stats)
    return stats
  }

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

  _registerScenario = (desc: string, scenario: Function, modifier: ScenarioModifier): void => {
    const api = new ScenarioApi(desc, this, uuidGen())
    const runner = async scenario => scenario(api)
    const execute = () => this._middleware(runner, scenario)
    this._scenarios.push({ api, desc, execute, modifier })
  }

}

