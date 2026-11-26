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

/** A single value or a list of values (multiEnum variables and lists in conditions) */
export type VariableValue = string | number | boolean | Array<string | number | boolean>;

/**
 * How a single variable is matched in a condition:
 *   - a value: the variable equals it (multiEnum variables: includes it)
 *   - a list: the variable equals one of the values (multiEnum variables: includes one of them)
 *   - { not: value | list }: the opposite
 */
export type VariableMatch = VariableValue | { not: VariableValue };

/** Every key must match. The keys are variable names. */
export type FlatCondition = Record<string, VariableMatch>;

/**
 * The `when` condition of a resource, template or variable. Every key must match. The keys are variable names, except
 * `any`: a list of conditions where at least one must match.
 */
export type Condition = { any?: FlatCondition[] } & { [variable: string]: VariableMatch | FlatCondition[] | undefined };

export interface ResourceConfig extends Config {
  name?: string;
  dependsOn?: string[];
  os?: Array<ResourceOs>;
  distro?: Array<LinuxDistro>;
  when?: Condition;
}

export enum VariableValueType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ENUM = 'enum',
  MULTI_ENUM = 'multiEnum',
}

export interface VariableConfig extends Config {
  type: 'variable';
  // Referenced with ${{ name }}. Variables of a template are scoped to the template
  name: string;
  // Defaults to text
  valueType?: VariableValueType;
  // Short question shown when asking for the value. Defaults to the name. Can be reworded freely (the name is the
  // identifier used by references).
  label?: string;
  // Longer help text shown under the label
  description?: string;
  // The allowed values of enum and multiEnum variables
  options?: string[];
  // Can reference other variables. Variables without a default are required
  default?: VariableValue;
  sensitive?: boolean;
  // Only ask for the variable if the condition matches
  when?: Condition;
}

export interface TemplateConfig extends Config {
  type: 'template';
  // Registry template name ("nvm"), profile scoped name ("@codify/nvm"), or a dashboard document id (uuid)
  source: string;
  // Exact semver version of a registry template. Defaults to the latest version
  version?: string;
  name?: string;
  dependsOn?: string[];
  os?: Array<ResourceOs>;
  distro?: Array<LinuxDistro>;
  // Only include the template if the condition matches
  when?: Condition;
  // Values for the variables of the template
  variables?: Record<string, VariableValue>;
}

export enum NoticeLevel {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
}

export enum NoticeStage {
  // After the apply completes (default)
  APPLY = 'apply',
  // With the plan, before asking to continue
  PLAN = 'plan',
}

export enum NoticeShow {
  // Only if a resource the notice depends on was changed and none of them failed (default)
  ON_CHANGE = 'onChange',
  // Also when there are no changes
  ALWAYS = 'always',
}

export interface NoticeConfig extends Config {
  type: 'notice';
  name?: string;
  // Short heading shown above the message
  title?: string;
  // Can reference variables with ${{ name }}
  message: string;
  // Defaults to info
  level?: NoticeLevel;
  // Defaults to apply
  stage?: NoticeStage;
  // Only for stage apply. Defaults to onChange
  show?: NoticeShow;
  // The resources or templates ("template.<name>") the notice is about. Defaults to the resources of the template it
  // is declared in, or to every resource when declared in the project
  dependsOn?: string[];
  os?: Array<ResourceOs>;
  distro?: Array<LinuxDistro>;
  // Only show the notice if the condition matches
  when?: Condition;
}

export enum MessageStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface PluginErrorData {
  errorType: string;
  message: string;
  data?: unknown;
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
  defaultConfig?: Record<string, unknown>;
  exampleConfigs?: {
    example1?: Record<string, unknown>;
    example2?: Record<string, unknown>;
  };
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

export interface FindInstancesRequestData {
  core: ResourceConfig;
}

export interface FindInstancesResponseData {
  request: FindInstancesRequestData;
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
  /**
   * The type of another resource that manages the same system state as this one (ex: `alias` is superseded by
   * `aliases`). When both are imported automatically (init / import all), this resource is skipped to avoid
   * importing the same state twice. It can still be imported, planned and destroyed directly.
   */
  supersededBy?: string;
  /**
   * Types of resources that must exist for this resource to work (ex: `homebrew`, `xcode-tools` on macOS). Unlike
   * `dependencies`, which only orders resources that are in the config, the CLI adds a default config for every
   * required type that is missing. Plugins built before this field existed don't send it.
   */
  requires?: string[];
}

export interface InitializeRequestData {
  verbosityLevel?: number;
}

export interface InitializeResponseData {
  resourceDefinitions: Array<ResourceDefinition>;
  minSupportedCliVersion?: string;
}

export interface CommandRequestData {
  command: string;
  options: {
    cwd?: string;
    interactive?: boolean;
    requiresRoot?: boolean;
    requiresSudoAskpass?: boolean;
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

export interface ApplyNoteRequestData {
  message: string;
  resourceType?: string;
}

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
