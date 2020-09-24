import * as T from "../types";
/**
 * The main purpose of this module. It is a helper function which accepts an object
 * describing instances in shorthand, as well as a second object describing the additional
 * more general config fields. It is usually the case that the first object will be vary
 * between players, and the second field will be the same between different players.
 */
export declare const gen: (instancesFort: T.Fort<({
    id: string;
    agent: {
        id: string;
        name: string;
        keystore_file: string;
        public_address: string;
    } & {
        test_agent?: boolean | undefined;
    };
    dna: {
        id: string;
        file: string;
    } & {
        hash?: string | undefined;
        uuid?: string | undefined;
    };
} & {
    storage?: any;
})[] | {
    [x: string]: {
        id: string;
        file: string;
    } & {
        hash?: string | undefined;
        uuid?: string | undefined;
    };
}>, commonFort?: {
    bridges?: {
        handle: string;
        caller_id: string;
        callee_id: string;
    }[] | undefined;
    dpki?: {
        instance_id: string;
        init_params: string;
    } | undefined;
    network?: {
        [x: string]: any;
    } | undefined;
    logger?: {
        [x: string]: any;
    } | undefined;
    metric_publisher?: ({
        region?: string | undefined;
        log_group_name?: string | undefined;
        log_stream_name?: string | undefined;
    } & {
        type: "cloudwatchlogs";
    }) | {
        type: "logger";
    } | undefined;
} | ((ConfigSeedArgs: any) => {
    bridges?: {
        handle: string;
        caller_id: string;
        callee_id: string;
    }[] | undefined;
    dpki?: {
        instance_id: string;
        init_params: string;
    } | undefined;
    network?: {
        [x: string]: any;
    } | undefined;
    logger?: {
        [x: string]: any;
    } | undefined;
    metric_publisher?: ({
        region?: string | undefined;
        log_group_name?: string | undefined;
        log_stream_name?: string | undefined;
    } & {
        type: "cloudwatchlogs";
    }) | {
        type: "logger";
    } | undefined;
}) | ((ConfigSeedArgs: any) => Promise<{
    bridges?: {
        handle: string;
        caller_id: string;
        callee_id: string;
    }[] | undefined;
    dpki?: {
        instance_id: string;
        init_params: string;
    } | undefined;
    network?: {
        [x: string]: any;
    } | undefined;
    logger?: {
        [x: string]: any;
    } | undefined;
    metric_publisher?: ({
        region?: string | undefined;
        log_group_name?: string | undefined;
        log_stream_name?: string | undefined;
    } & {
        type: "cloudwatchlogs";
    }) | {
        type: "logger";
    } | undefined;
}>) | undefined) => (args: T.ConfigSeedArgs) => Promise<T.RawConductorConfig>;
/**
 * 1. If a dna config object contains a URL in the path, download the file to a temp directory,
 *     and rewrite the path to point to downloaded file.
 * 2. Then, if the hash is not set, calculate the hash and set it.
 * 3. Add the UUID for this scenario
 */
export declare const resolveDna: (inputDna: {
    id: string;
    file: string;
} & {
    hash?: string | undefined;
    uuid?: string | undefined;
}, providedUuid: string) => Promise<{
    id: string;
    file: string;
} & {
    hash?: string | undefined;
    uuid?: string | undefined;
}>;
export declare const getConfigPath: (configDir: any) => any;
export declare const desugarInstances: (instances: {
    [x: string]: {
        id: string;
        file: string;
    } & {
        hash?: string | undefined;
        uuid?: string | undefined;
    };
}, args: T.ConfigSeedArgs) => ({
    id: string;
    agent: {
        id: string;
        name: string;
        keystore_file: string;
        public_address: string;
    } & {
        test_agent?: boolean | undefined;
    };
    dna: {
        id: string;
        file: string;
    } & {
        hash?: string | undefined;
        uuid?: string | undefined;
    };
} & {
    storage?: any;
})[];
export declare const makeTestAgent: (id: any, { playerName, uuid }: {
    playerName: any;
    uuid: any;
}) => {
    name: string;
    id: any;
    keystore_file: string;
    public_address: string;
    test_agent: boolean;
};
export declare const genPartialConfigFromDryInstances: (instances: ({
    id: string;
    agent: {
        id: string;
        name: string;
        keystore_file: string;
        public_address: string;
    } & {
        test_agent?: boolean | undefined;
    };
    dna: {
        id: string;
        file: string;
    } & {
        hash?: string | undefined;
        uuid?: string | undefined;
    };
} & {
    storage?: any;
})[], args: T.ConfigSeedArgs) => Promise<any>;
export declare const getDnaHash: (dnaPath: any, uuid: any) => Promise<any>;
export declare const assertUniqueTestAgentNames: (configs: T.RawConductorConfig[]) => void;
