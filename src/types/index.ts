import type {SpawnOptions} from "node:child_process";
import type {ErrorObject} from "ajv";

export interface StringIndexedObject {
  [x: string]: unknown;
}

export interface Config extends StringIndexedObject {
  type: string;
}

export interface ProjectConfig extends Config {
  version?: string;
  plugins?: Record<string, string>;
  description?: string;
}

export enum ResourceOs {
  LINUX = 'linux',
  MACOS = 'macOS',
  WINDOWS = 'windows',
}

export interface ResourceConfig extends Config {
  name?: string;
  dependsOn?: string[];
  os?: Array<ResourceOs>;
}

export enum MessageStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface IpcMessage {
  cmd: string;
  status?: MessageStatus;
  data: unknown | null;
}

export interface IpcMessageV2 {
  cmd: string;
  requestId: string;
  status?: MessageStatus;
  data: unknown | null;
}

/**
 * Processed resource that is in a format suitable for sending. The core parameters (such as type and name) and other parameters
 * are separate for easier processing.
 */
export interface ResourceJson {
  core: ResourceConfig;
  parameters: Record<string, unknown>;
}

export interface ValidateRequestData {
  configs: Array<ResourceJson>;
}

export interface ValidateResponseData {
  resourceValidations: Array<{
    resourceType: string;
    resourceName?: string;
    schemaValidationErrors: ErrorObject[];
    customValidationErrorMessage?: string;
    isValid: boolean;
  }>;
}

export interface PlanRequestData {
  core: ResourceConfig;
  desired?: Record<string, unknown>;
  state?: Record<string, unknown>;
  isStateful: boolean
}

export enum ResourceOperation {
  CREATE = "create",
  DESTROY = "destroy",
  MODIFY = "modify",
  RECREATE = "recreate",
  NOOP = "noop"
}

export enum ParameterOperation {
  ADD = "add",
  REMOVE = "remove",
  MODIFY = "modify",
  NOOP = "noop"
}

export interface PlanResponseData {
  planId: string;
  operation: ResourceOperation;
  resourceName?: string;
  resourceType: string;
  isStateful: boolean;
  parameters: Array<{
    name: string;
    operation: ParameterOperation;
    previousValue: unknown | null;
    newValue: unknown | null;
    isSensitive?: boolean;
  }>
}

export interface GetResourceInfoRequestData {
  type: string;
}

export interface GetResourceInfoResponseData {
  plugin: string;
  type: string;
  schema?: Record<string, unknown>;
  dependencies?: string[];
  /**
   * @deprecated: Use import and destroy instead.
   */
  import?: {
    requiredParameters: string[] | null;
  },
  operatingSystems?: OS[];
  linuxDistros?: LinuxDistro[];
  importAndDestroy?: {
    requiredParameters: string[] | null;
    preventImport?: boolean;
  },
  sensitiveParameters?: string[];
  allowMultiple: boolean;
}

export interface MatchRequestData {
  resource: {
    core: ResourceConfig;
    parameters: Record<string, unknown>;
  };
  array: Array<{
    core: ResourceConfig;
    parameters: Record<string, unknown>;
  }>
}

export interface MatchResponseData {
  match?: {
    core: ResourceConfig;
    parameters: Record<string, unknown>;
  }
}

export interface ImportRequestData {
  core: ResourceConfig;
  parameters: Record<string, unknown>;
  autoSearchAll?: boolean;
}

export interface ImportResponseData {
  request: ResourceJson;
  result: Array<ResourceJson>;
}

export interface ApplyRequestData {
  planId?: string;
  plan?: {
    operation: ResourceOperation;
    resourceName?: string;
    resourceType: string;
    isStateful: boolean;
    parameters: Array<{
      name: string;
      operation: ParameterOperation;
      newValue: unknown | null;
      previousValue: unknown | null;
      isSensitive?: boolean;
    }>
  }
}

export interface ResourceDefinition {
  type: string;
  dependencies: string[];
  operatingSystems?: OS[];
  linuxDistros?: LinuxDistro[];
  sensitiveParameters?: string[];
}

export interface InitializeRequestData {
  verbosityLevel?: number;
}

export interface InitializeResponseData {
  resourceDefinitions: Array<ResourceDefinition>;
}

export interface CommandRequestData {
  command: string;
  options: {
    cwd?: string;
    interactive?: boolean;
    requiresRoot?: boolean;
    stdin?: boolean;
  } & Omit<SpawnOptions, 'stdio' | 'shell' | 'detached'>
}

export interface CommandRequestResponseData {
  status: SpawnStatus,
  exitCode: number;
  data: string;
}

export interface PressKeyToContinueRequestData {
  promptMessage?: string;
}

export interface PressKeyToContinueResponseData {}

export interface SetVerbosityRequestData {
  verbosityLevel: number;
}

export interface EmptyResponseData {}

export enum SpawnStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum OS {
  Darwin = 'Darwin',
  Linux = 'Linux',
  Windows = 'Windows_NT',
}

export enum LinuxDistro {
  DEBIAN_BASED = 'debian-based',
  RPM_BASED = 'rpm-based',
  ARCH = 'arch',
  CENTOS = 'centos',
  DEBIAN = 'debian',
  FEDORA = 'fedora',
  RHEL = 'rhel',
  UBUNTU = 'ubuntu',
  ALPINE = 'alpine',
  AMAZON_LINUX = 'amzn',
  OPENSUSE = 'opensuse',
  SUSE = 'sles',
  MANJARO = 'manjaro',
  MINT = 'linuxmint',
  POP_OS = 'pop',
  ELEMENTARY_OS = 'elementary',
  KALI = 'kali',
  GENTOO = 'gentoo',
  SLACKWARE = 'slackware',
}
