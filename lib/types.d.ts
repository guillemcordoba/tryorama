import { ScenarioApi } from "./api";
import * as t from "io-ts";
import { Conductor } from "./conductor";
import { Player } from "./player";
export declare const decodeOrThrow: (validator: any, value: any, extraMsg?: string) => any;
export declare type ObjectN<V> = {
    [name: number]: V;
};
export declare type ObjectS<V> = {
    [name: string]: V;
};
export declare type SpawnConductorFn = (player: Player, args: any) => Promise<Conductor>;
export declare type ScenarioFn = (s: ScenarioApi) => Promise<void>;
export declare type IntermediateConfig = RawConductorConfig;
export declare type ConfigSeed = (args: ConfigSeedArgs) => Promise<IntermediateConfig>;
export declare type PartialConfigSeedArgs = {
    interfacePort: number;
    configDir: string;
};
export declare type ConfigSeedArgs = PartialConfigSeedArgs & {
    scenarioName: string;
    playerName: string;
    uuid: string;
};
export declare type AnyConfigBuilder = ConfigSeed | EitherInstancesConfig;
export declare type PlayerConfigs = ObjectS<ConfigSeed> | Array<ConfigSeed>;
export declare type MachineConfigs = ObjectS<PlayerConfigs>;
export declare const interfaceWsUrl: ({ urlBase, port }: {
    urlBase: any;
    port: any;
}) => string;
/** "F or T" */
export declare type Fort<T> = T | ((ConfigSeedArgs: any) => T) | ((ConfigSeedArgs: any) => Promise<T>);
export declare const collapseFort: <T>(fort: Fort<T>, args: ConfigSeedArgs) => Promise<T>;
export declare const AgentConfigV: t.IntersectionC<[t.TypeC<{
    id: t.StringC;
    name: t.StringC;
    keystore_file: t.StringC;
    public_address: t.StringC;
}>, t.PartialC<{
    test_agent: t.BooleanC;
}>]>;
export declare type AgentConfig = t.TypeOf<typeof AgentConfigV>;
export declare const DnaConfigV: t.IntersectionC<[t.TypeC<{
    id: t.StringC;
    file: t.StringC;
}>, t.PartialC<{
    hash: t.StringC;
    uuid: t.StringC;
}>]>;
export declare type DnaConfig = t.TypeOf<typeof DnaConfigV>;
export declare const StorageConfigV: t.AnyC;
export declare type StorageConfig = t.TypeOf<typeof StorageConfigV>;
export declare const RawInstanceConfigV: t.TypeC<{
    id: t.StringC;
    agent: t.StringC;
    dna: t.StringC;
}>;
export declare type RawInstanceConfig = t.TypeOf<typeof RawInstanceConfigV>;
export declare const DryInstanceConfigV: t.IntersectionC<[t.TypeC<{
    id: t.StringC;
    agent: t.IntersectionC<[t.TypeC<{
        id: t.StringC;
        name: t.StringC;
        keystore_file: t.StringC;
        public_address: t.StringC;
    }>, t.PartialC<{
        test_agent: t.BooleanC;
    }>]>;
    dna: t.IntersectionC<[t.TypeC<{
        id: t.StringC;
        file: t.StringC;
    }>, t.PartialC<{
        hash: t.StringC;
        uuid: t.StringC;
    }>]>;
}>, t.PartialC<{
    storage: t.AnyC;
}>]>;
export declare type DryInstanceConfig = t.TypeOf<typeof DryInstanceConfigV>;
export declare const BridgeConfigV: t.TypeC<{
    handle: t.StringC;
    caller_id: t.StringC;
    callee_id: t.StringC;
}>;
export declare type BridgeConfig = t.TypeOf<typeof BridgeConfigV>;
export declare const DpkiConfigV: t.TypeC<{
    instance_id: t.StringC;
    init_params: t.StringC;
}>;
export declare type DpkiConfig = t.TypeOf<typeof DpkiConfigV>;
export declare const NetworkModeV: t.UnionC<[t.LiteralC<"n3h">, t.LiteralC<"memory">, t.LiteralC<"websocket">]>;
export declare type NetworkMode = t.TypeOf<typeof NetworkModeV>;
export declare const RawNetworkConfigV: t.RecordC<t.StringC, t.AnyC>;
export declare type RawNetworkConfig = t.TypeOf<typeof RawNetworkConfigV>;
export declare const NetworkConfigV: t.UnionC<[t.UnionC<[t.LiteralC<"n3h">, t.LiteralC<"memory">, t.LiteralC<"websocket">]>, t.RecordC<t.StringC, t.AnyC>]>;
export declare type NetworkConfig = t.TypeOf<typeof NetworkConfigV>;
export declare const RawLoggerConfigV: t.RecordC<t.StringC, t.AnyC>;
export declare type RawLoggerConfig = t.TypeOf<typeof RawLoggerConfigV>;
export declare const RawTracingConfigV: t.RecordC<t.StringC, t.AnyC>;
export declare type RawTracingConfig = t.TypeOf<typeof RawTracingConfigV>;
export declare const LoggerConfigV: t.UnionC<[t.BooleanC, t.RecordC<t.StringC, t.AnyC>]>;
export declare type LoggerConfig = t.TypeOf<typeof LoggerConfigV>;
export declare const CloudWatchLogsConfigV: t.PartialC<{
    region: t.StringC;
    log_group_name: t.StringC;
    log_stream_name: t.StringC;
}>;
export declare type CloudWatchLogsConfig = t.TypeOf<typeof CloudWatchLogsConfigV>;
export declare const RawCloudWatchLogsConfigV: t.IntersectionC<[t.PartialC<{
    region: t.StringC;
    log_group_name: t.StringC;
    log_stream_name: t.StringC;
}>, t.TypeC<{
    type: t.LiteralC<"cloudwatchlogs">;
}>]>;
export declare type RawCloudWatchLogsConfig = t.TypeOf<typeof RawCloudWatchLogsConfigV>;
export declare const LoggerMetricPublisherV: t.LiteralC<"logger">;
export declare type LoggerMetricPublisher = t.TypeOf<typeof LoggerMetricPublisherV>;
export declare const RawLoggerMetricPublisherV: t.TypeC<{
    type: t.LiteralC<"logger">;
}>;
export declare type RawLoggerMetricPublisher = t.TypeOf<typeof RawLoggerMetricPublisherV>;
export declare const MetricPublisherConfigV: t.UnionC<[t.LiteralC<"logger">, t.PartialC<{
    region: t.StringC;
    log_group_name: t.StringC;
    log_stream_name: t.StringC;
}>]>;
export declare type MetricPublisherConfig = t.TypeOf<typeof MetricPublisherConfigV>;
export declare const RawMetricPublisherConfigV: t.UnionC<[t.IntersectionC<[t.PartialC<{
    region: t.StringC;
    log_group_name: t.StringC;
    log_stream_name: t.StringC;
}>, t.TypeC<{
    type: t.LiteralC<"cloudwatchlogs">;
}>]>, t.TypeC<{
    type: t.LiteralC<"logger">;
}>]>;
export declare type RawMetricPublisherConfig = t.TypeOf<typeof RawMetricPublisherConfigV>;
export declare type RawSignalsConfig = {
    trace: boolean;
    consistency: boolean;
};
export declare const ConductorConfigCommonV: t.PartialC<{
    bridges: t.ArrayC<t.TypeC<{
        handle: t.StringC;
        caller_id: t.StringC;
        callee_id: t.StringC;
    }>>;
    dpki: t.TypeC<{
        instance_id: t.StringC;
        init_params: t.StringC;
    }>;
    network: t.RecordC<t.StringC, t.AnyC>;
    logger: t.RecordC<t.StringC, t.AnyC>;
    metric_publisher: t.UnionC<[t.IntersectionC<[t.PartialC<{
        region: t.StringC;
        log_group_name: t.StringC;
        log_stream_name: t.StringC;
    }>, t.TypeC<{
        type: t.LiteralC<"cloudwatchlogs">;
    }>]>, t.TypeC<{
        type: t.LiteralC<"logger">;
    }>]>;
}>;
export declare type ConductorConfigCommon = t.TypeOf<typeof ConductorConfigCommonV>;
/** Base representation of a Conductor */
export declare const DryInstancesConfigV: t.ArrayC<t.IntersectionC<[t.TypeC<{
    id: t.StringC;
    agent: t.IntersectionC<[t.TypeC<{
        id: t.StringC;
        name: t.StringC;
        keystore_file: t.StringC;
        public_address: t.StringC;
    }>, t.PartialC<{
        test_agent: t.BooleanC;
    }>]>;
    dna: t.IntersectionC<[t.TypeC<{
        id: t.StringC;
        file: t.StringC;
    }>, t.PartialC<{
        hash: t.StringC;
        uuid: t.StringC;
    }>]>;
}>, t.PartialC<{
    storage: t.AnyC;
}>]>>;
export declare type DryInstancesConfig = t.TypeOf<typeof DryInstancesConfigV>;
/** Shorthand representation of a Conductor,
 *  where keys of `instance` are used as instance IDs as well as agent IDs
 */
export declare const SugaredInstancesConfigV: t.RecordC<t.StringC, t.IntersectionC<[t.TypeC<{
    id: t.StringC;
    file: t.StringC;
}>, t.PartialC<{
    hash: t.StringC;
    uuid: t.StringC;
}>]>>;
export declare type SugaredInstancesConfig = t.TypeOf<typeof SugaredInstancesConfigV>;
/** For situations where we can accept either flavor of config */
export declare const EitherInstancesConfigV: t.UnionC<[t.ArrayC<t.IntersectionC<[t.TypeC<{
    id: t.StringC;
    agent: t.IntersectionC<[t.TypeC<{
        id: t.StringC;
        name: t.StringC;
        keystore_file: t.StringC;
        public_address: t.StringC;
    }>, t.PartialC<{
        test_agent: t.BooleanC;
    }>]>;
    dna: t.IntersectionC<[t.TypeC<{
        id: t.StringC;
        file: t.StringC;
    }>, t.PartialC<{
        hash: t.StringC;
        uuid: t.StringC;
    }>]>;
}>, t.PartialC<{
    storage: t.AnyC;
}>]>>, t.RecordC<t.StringC, t.IntersectionC<[t.TypeC<{
    id: t.StringC;
    file: t.StringC;
}>, t.PartialC<{
    hash: t.StringC;
    uuid: t.StringC;
}>]>>]>;
export declare type EitherInstancesConfig = t.TypeOf<typeof EitherInstancesConfigV>;
declare type RawInterfaceConfig = {
    admin: boolean;
    choose_free_port: boolean;
    id: string;
    driver: {
        type: string;
        port: number;
    };
    instances: Array<{
        id: string;
    }>;
};
export interface RawConductorConfig {
    persistence_dir: string;
    agents: Array<AgentConfig>;
    dnas: Array<DnaConfig>;
    instances: Array<RawInstanceConfig>;
    interfaces: Array<RawInterfaceConfig>;
    signals: RawSignalsConfig;
    bridges?: Array<BridgeConfig>;
    dpki?: DpkiConfig;
    network?: RawNetworkConfig;
    logger?: RawLoggerConfig;
    tracing?: RawTracingConfig;
    metric_publisher?: RawMetricPublisherConfig;
}
export declare type KillFn = (signal?: string) => Promise<void>;
export {};
