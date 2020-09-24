import * as T from "../types";
export declare const unsupportedMergeConfigs: (name: any) => void;
export declare const combineConfigs: (configs: T.ObjectS<T.PlayerConfigs>) => T.ConfigSeed;
/**
 * Define a standard way to add extra string to ID identifiers for use in combining configs
 * This is used to modify file paths as well, so it should result in a valid path.
 * i.e.:
 *     adjoin('x')('path/to/foo') === 'path/to/foo--x'   // OK
 *     adjoin('x')('path/to/foo') === 'x::path/to/foo'   // BAD
 */
export declare const adjoin: (tag: any) => (x: any) => string;
/**
 * Given a map with keys as conductor names and values as conductor configs Objects,
 * merge all configs into a single valid conductor config Object.
 * Basically, each agent ID is adjoined by the conductor name, and references updated
 * to preserve uniqueness. Then all agents, dnas, instances, and bridges are merged
 * together.
 *
 * All other options, like logging, interfaces, etc. are taken from one particular config,
 * with the assumption that the others are the same. The `standard` param allows you to
 * specify, by conductor name, which config to use to pull these other values from.
 */
export declare const mergeJsonConfigs: (configs: T.ObjectS<T.RawConductorConfig>, standard?: string | undefined) => T.RawConductorConfig & {
    agents: any[];
    dnas: ({
        id: string;
        file: string;
    } & {
        hash?: string | undefined;
        uuid?: string | undefined;
    })[];
    bridges: any[];
    instances: any[];
    interfaces: {
        admin: boolean;
        choose_free_port: boolean;
        id: string;
        driver: {
            type: string;
            port: number;
        };
        instances: {
            id: string;
        }[];
    }[];
};
