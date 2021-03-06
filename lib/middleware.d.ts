import * as T from "./types";
interface ApiPlayers<Config> {
    players: (config: Config, data?: any) => Promise<any>;
}
declare type ApiMachineConfigs = ApiPlayers<T.MachineConfigs>;
declare type ApiPlayerConfigs = ApiPlayers<T.PlayerConfigs>;
interface ExecutorApi {
    players: any;
    description: string;
    fail: Function;
}
/**
 * A Runner is provided by the [Orchestrator], but it is exposed to the middleware
 * author so that it can be called in the appropriate context
 */
export declare type Runner<A> = (f: A) => Promise<void>;
/** RunnerS assumes a normal Scenario */
export declare type RunnerS<A> = (f: Scenario<A>) => Promise<void>;
/** The default Scenario function type which takes a single argument */
export declare type Scenario<S> = (s: S) => Promise<void>;
/** A scenario function which takes two arguments */
export declare type Scenario2<S, T> = (s: S, t: T) => Promise<void>;
/** A scenario function which takes three arguments */
export declare type Scenario3<S, T, U> = (s: S, t: T, u: U) => Promise<void>;
/** A scenario function which takes four arguments */
export declare type Scenario4<S, T, U, V> = (s: S, t: T, u: U, v: V) => Promise<void>;
/**
 * Middleware is a composable decorator for scenario functions. A MiddlewareS takes two functions:
 * - the function which will run the scenario
 * - the scenario function itself
 *
 * With these, as a middleware author, you are free to create a new scenario function
 * that wraps the original one, and then use the `run` function to eventually execute
 * that scenario. The purpose of exposing the `run` function is to allow the middleware
 * to set up extra context outside of the running of the scenario, e.g. for integrating
 * with test harnesses.
 */
export declare type Middleware<A, B> = (run: Runner<B>, original: A) => Promise<void>;
/** Middleware assumes mapping from a normal Scenario to another */
export declare type MiddlewareS<A, B> = (run: RunnerS<B>, original: Scenario<A>) => Promise<void>;
/** The no-op middleware */
export declare const unit: <A>(run: RunnerS<A>, f: Scenario<A>) => Promise<void>;
/** Compose two middlewares, typesafe */
export declare const compose: <A, B, C>(x: Middleware<A, B>, y: Middleware<B, C>) => Middleware<A, C>;
/** Compose 2 middlewares, typesafe. Same as `compose` */
export declare const compose2: <A, B, C>(x: Middleware<A, B>, y: Middleware<B, C>) => Middleware<A, C>;
/** Compose 3 middlewares, typesafe */
export declare const compose3: <A, B, C, D>(a: Middleware<A, B>, b: Middleware<B, C>, c: Middleware<C, D>) => Middleware<A, D>;
/** Compose 4 middlewares, typesafe */
export declare const compose4: <A, B, C, D, E>(a: Middleware<A, B>, b: Middleware<B, C>, c: Middleware<C, D>, d: Middleware<D, E>) => Middleware<A, E>;
/** Compose 5 middlewares, typesafe */
export declare const compose5: <A, B, C, D, E, F>(a: Middleware<A, B>, b: Middleware<B, C>, c: Middleware<C, D>, d: Middleware<D, E>, e: Middleware<E, F>) => Middleware<A, F>;
/**
 * Combine multiple middlewares into a single middleware.
 * NOT typesafe, i.e. type info is lost, but convenient.
 * The middlewares are applied in the *reverse order* that they're provided.
 * i.e. the middleware at the end of the chain is the one to act directly on the user-supplied scenario,
 * and the first middleware is the one to provide the clean vanilla scenario that the orchestrator knows how to run
 * So, if using something fancy like `tapeExecutor`, put it at the beginning of the chain.
 */
export declare const combine: (...ms: any[]) => any;
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
export declare const tapeExecutor: <A extends ExecutorApi>(tape: any) => Middleware<Scenario2<A, any>, Scenario<A>>;
/**
 * Run tests in series rather than in parallel.
 * Needs to be invoked as a function so types can be inferred at moment of creation.
 */
export declare const runSeries: <A>() => Middleware<A, A>;
/**
 * Take all configs defined for all machines and all players,
 * merge the configs into one big TOML file,
 * and create a single player on the local machine to run it.
 * TODO: currently BROKEN.
*/
export declare const singleConductor: MiddlewareS<ApiMachineConfigs, ApiMachineConfigs>;
export declare const callSync: (run: any, f: any) => any;
export declare const dumbWaiter: (interval: any) => (run: any, f: any) => MiddlewareS<ApiPlayers<T.ObjectS<T.PlayerConfigs>>, ApiPlayers<T.ObjectS<T.PlayerConfigs>>>;
/**
 * Allow a test to skip the level of machine configuration
 * This middleware wraps the player configs in the "local" machine
 */
export declare const localOnly: MiddlewareS<ApiPlayerConfigs, ApiMachineConfigs>;
/**
 * Allow a test to skip the level of machine configuration
 * This middleware finds a new machine for each N players, and returns the
 * properly wrapped config specifying the acquired machine endpoints
 */
export declare const groupPlayersByMachine: (trycpEndpoints: string[], playersPer: number) => MiddlewareS<ApiPlayers<T.PlayerConfigs>, ApiPlayers<T.ObjectS<T.PlayerConfigs>>>;
/**
 * Allow a test to skip the level of machine configuration
 * This middleware finds a new machine for each player, and returns the
 * properly wrapped config specifying the acquired machine endpoints
 */
export declare const machinePerPlayer: (endpoints: any) => MiddlewareS<ApiPlayers<T.PlayerConfigs>, ApiPlayers<T.ObjectS<T.PlayerConfigs>>>;
export {};
