# @codifycli/schemas

[![npm version](https://img.shields.io/npm/v/@codifycli/schemas.svg)](https://www.npmjs.com/package/@codifycli/schemas)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

JSON Schemas and TypeScript types that govern the message formats and configuration file formats for [Codify](https://codifycli.com).

## Overview

**@codifycli/schemas** is the central contract library for the Codify ecosystem, providing:

- **JSON Schemas** for validating IPC messages between Codify CLI and plugins
- **TypeScript types** for type-safe plugin development
- **Configuration schemas** for Codify project and resource files
- **IDE integration** via schema store for autocomplete and validation

This package ensures that all components of the Codify ecosystem communicate using a well-defined, validated protocol.

## Installation

```bash
npm install @codifycli/schemas
```

## Usage

### For Plugin Developers

Import schemas and types to build type-safe Codify plugins:

```typescript
import {
  InitializeRequestData,
  InitializeResponseData,
  ValidateRequestData,
  ValidateResponseData,
  PlanRequestData,
  PlanResponseData,
  ApplyRequestData,
  MessageCmd,
  MessageStatus,
  ResourceOperation,
} from '@codifycli/schemas';

// Handle initialize message
function handleInitialize(request: InitializeRequestData): InitializeResponseData {
  return {
    resourceDefinitions: [
      {
        type: 'my-resource',
        dependencies: [],
        os: ['linux', 'macOS'],
        linuxDistros: ['debian', 'ubuntu'],
        isSensitive: [],
        allowMultiple: false,
      }
    ]
  };
}

// Handle plan message
function handlePlan(request: PlanRequestData): PlanResponseData {
  return {
    planId: crypto.randomUUID(),
    operation: ResourceOperation.CREATE,
    parameterChanges: [],
  };
}
```

### Validating Messages

Use the included AJV validator to validate IPC messages:

```typescript
import Ajv from 'ajv';
import {
  InitializeRequestDataSchema,
  InitializeResponseDataSchema,
} from '@codifycli/schemas';

const ajv = new Ajv({ strict: true });

// Validate request
const validateRequest = ajv.compile(InitializeRequestDataSchema);
if (!validateRequest(data)) {
  console.error('Invalid request:', validateRequest.errors);
}

// Validate response
const validateResponse = ajv.compile(InitializeResponseDataSchema);
if (!validateResponse(responseData)) {
  console.error('Invalid response:', validateResponse.errors);
}
```

### Configuration File Schemas

Use configuration schemas to validate Codify config files:

```typescript
import {
  ConfigFileSchema,
  ProjectSchema,
  ResourceSchema,
  Config,
  ProjectConfig,
  ResourceConfig,
} from '@codifycli/schemas';

// Type-safe configuration
const config: Config[] = [
  {
    type: 'project',
    version: '1.0.0',
    plugins: {
      'my-plugin': '1.0.0',
    },
  },
  {
    type: 'my-resource',
    name: 'example',
    dependsOn: [],
    os: ['linux'],
  },
];
```

## Available Schemas

### Configuration Schemas

- **ConfigFileSchema** - Top-level configuration file format
- **ProjectSchema** - Project block with version and plugin declarations
- **ResourceSchema** - Base schema for resource configurations

### Message Schemas

Plugin lifecycle messages:

- **InitializeRequestDataSchema / InitializeResponseDataSchema** - Plugin startup
- **ValidateRequestDataSchema / ValidateResponseDataSchema** - Validate resources
- **PlanRequestDataSchema / PlanResponseDataSchema** - Calculate changes
- **ApplyRequestDataSchema** - Execute changes
- **ImportRequestDataSchema / ImportResponseDataSchema** - Import existing resources
- **MatchRequestDataSchema / MatchResponseDataSchema** - Find matching resources
- **GetResourceInfoRequestDataSchema / GetResourceInfoResponseDataSchema** - Query metadata

CLI support messages:

- **CommandRequestDataSchema / CommandResponseDataSchema** - Execute commands
- **PressKeyToContinueRequestDataSchema / PressKeyToContinueResponseDataSchema** - User interaction
- **SetVerbosityRequestDataSchema** - Adjust logging level
- **ErrorResponseDataSchema** - Error reporting
- **EmptyResponseDataSchema** - No data responses

### IPC Message Wrappers

- **IpcMessageSchema** - V1 message wrapper (cmd, status, data)
- **IpcMessageV2Schema** - V2 message wrapper (adds requestId)

## TypeScript Types

The package exports comprehensive TypeScript types and enums:

### Enums

- `MessageCmd` - Command identifiers (initialize, validate, plan, apply, etc.)
- `MessageStatus` - SUCCESS | ERROR
- `ResourceOperation` - CREATE | DESTROY | MODIFY | RECREATE | NOOP
- `ParameterOperation` - ADD | REMOVE | MODIFY | NOOP
- `ResourceOs` - LINUX | MACOS | WINDOWS
- `OS` - Darwin | Linux | Windows_NT
- `LinuxDistro` - Comprehensive Linux distribution list
- `SpawnStatus` - SUCCESS | ERROR

### Interfaces

All request/response data types are exported as TypeScript interfaces, providing full type safety when building plugins.

## IDE Integration

The package includes a comprehensive schema store file (`codify-schema.json`) for IDE autocomplete and validation. Configure your IDE to use this schema for `.codify` or similar configuration files.

## Development

### Running Tests

```bash
npm test
```

Tests use Vitest and AJV to validate that all schemas compile correctly and accept/reject appropriate inputs.

### Building

```bash
npm run prepublishOnly
```

Compiles TypeScript and prepares the package for publishing.

### Project Structure

```
src/
├── messages/              # Request/response schemas for IPC messages
├── types/                 # TypeScript type definitions
├── schemastore/          # IDE integration schema
├── *.json                # Core configuration schemas
└── index.ts              # Main exports
```

## Plugin Development Guide

When building a Codify plugin, you'll implement handlers for these core messages:

1. **Initialize** - Declare what resource types your plugin manages
2. **Validate** - Validate user configurations for your resources
3. **Plan** - Determine what changes need to be made
4. **Apply** - Execute the planned changes
5. **Import** (optional) - Discover existing resources to bring under Codify management

Each message type has strictly validated request and response formats defined by this package.

## Contributing

Contributions are welcome! Please ensure:

- All schemas have corresponding test files
- Tests pass with `npm test`
- TypeScript types are updated alongside schemas
- Changes maintain backward compatibility

## License

ISC

## Links

- [Codify CLI](https://codifycli.com)
- [npm package](https://www.npmjs.com/package/@codifycli/schemas)
- [GitHub repository](https://github.com/codifycli/schemas)