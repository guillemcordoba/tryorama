import * as T from '../types';
declare const _default: {
    gen: (instancesFort: T.Fort<({
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
    dna: (file: any, id?: any, opts?: {}) => {
        id: string;
        file: string;
    } & {
        hash?: string | undefined;
        uuid?: string | undefined;
    };
    dpki: (instanceId: string, initParams: Record<string, any>) => {
        instance_id: string;
        init_params: string;
    };
    bridge: (handle: any, caller_id: any, callee_id: any) => {
        handle: string;
        caller_id: string;
        callee_id: string;
    };
    network: (network: {
        [x: string]: any;
    } | "websocket" | "n3h" | "memory") => ({ configDir }: {
        configDir: any;
    }) => Promise<{
        [x: string]: any;
    }>;
    logger: (logger: any) => any;
    metricPublisher: (mp: {
        region?: string | undefined;
        log_group_name?: string | undefined;
        log_stream_name?: string | undefined;
    } | "logger") => ({
        region?: string | undefined;
        log_group_name?: string | undefined;
        log_stream_name?: string | undefined;
    } & {
        type: "cloudwatchlogs";
    }) | {
        type: "logger";
    };
};
export default _default;
