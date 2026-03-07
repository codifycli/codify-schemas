# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**@codifycli/schemas** is the central contract library for the Codify ecosystem. It defines:
- JSON Schemas for all IPC message formats between Codify CLI core and plugins
- TypeScript type definitions for type-safe message handling
- Configuration file schemas for Codify projects and resources
- Schema store integration for IDE autocomplete/validation

Codify is an infrastructure-as-code tool with a plugin-based architecture where the CLI core orchestrates resource management through plugins that communicate via IPC messages validated by this package.

## Common Commands

### Testing
```bash
npm test                    # Run all tests with vitest
```

### Building
```bash
npm run prepublishOnly      # Compile TypeScript and prepare for publishing (runs `tsc`)
```

### Scripts
```bash
npm run script:upload-plugin  # Upload resource schemas to Supabase registry
```

## Architecture

### Plugin Communication Protocol

Codify uses a request/response IPC protocol where:
- **Core CLI** sends messages to plugins with commands like `initialize`, `validate`, `plan`, `apply`, `import`
- **Plugins** respond with structured data validated against response schemas
- **Two message wrapper versions**: V1 (basic) and V2 (adds `requestId` for correlation)

### Directory Structure

```
src/
├── messages/              # Request/response schemas for each IPC message type
│   ├── *-request-data-schema.json
│   ├── *-response-data-schema.json
│   └── commands.ts        # MessageCmd enum
├── types/                 # TypeScript interfaces and enums
│   └── index.ts          # All exported types
├── schemastore/          # IDE integration schema
│   └── codify-schema.json # Combined schema for autocomplete (2,462 lines)
├── config-file-schema.json     # Top-level config file format
├── project-schema.json         # "project" block definition
├── resource-schema.json        # Base resource configuration
├── ipc-message-schema.json     # V1 message wrapper
├── ipc-message-schema-v2.json  # V2 message wrapper (adds requestId)
└── index.ts                    # Main exports
```

### Key Schemas

**Configuration Schemas:**
- `config-file-schema.json` - Top-level array of config blocks with `type` field
- `project-schema.json` - Special "project" block with version, plugins, description
- `resource-schema.json` - Base schema for all resources (type, name, dependsOn, os)

**Message Schemas (src/messages/):**
- Initialize: Plugin startup, capability discovery
- Validate: Resource configuration validation
- Plan: Calculate changes (create/destroy/modify/recreate/noop)
- Apply: Execute planned changes
- Import: Discover existing system resources
- Match: Find matching resource in array
- Get Resource Info: Query resource metadata
- Command Request/Response: Execute commands (sudo/interactive)
- Set Verbosity, Press Key to Continue, Error Response, Empty Response

**Schema Store:**
- `codify-schema.json` - Comprehensive IDE integration schema combining all resource types

### TypeScript Integration

- Uses `resolveJsonModule: true` to import JSON schemas as typed modules
- All JSON schemas are copied to `dist/` during build
- Types and schemas are co-located for easier maintenance
- Strict mode enabled with full null checking

### Build Process

1. TypeScript compiles `src/` → `dist/`
2. JSON schemas copied to `dist/`
3. Type declarations (`.d.ts`) generated
4. Source maps created
5. Package published as ES modules

## Development Workflow

### Adding a New Message Type

1. Create schemas in `src/messages/`:
   - `[name]-request-data-schema.json`
   - `[name]-response-data-schema.json`
2. Add TypeScript types in `src/types/index.ts`:
   - `[Name]RequestData` interface
   - `[Name]ResponseData` interface
3. Update `MessageCmd` enum if needed in `src/messages/commands.ts`
4. Import and export schemas in `src/index.ts`
5. Create test: `src/messages/[name]-request-data-schema.test.ts`
6. Run tests and build

### Testing Pattern

Each schema has a `.test.ts` file that:
- Uses AJV in strict mode to compile the schema
- Tests valid inputs return `true`
- Tests invalid inputs return `false` with appropriate errors
- Validates naming conventions and patterns

**Configuration:** Tests use `tsconfig.test.json` which disables `strictNullChecks` for testing flexibility.

### Resource Schema Management

Resource schemas are defined in `src/schemastore/codify-schema.json` and uploaded to Supabase registry via `scripts/upload-resources.ts`. This script:
1. Upserts "default" plugin
2. Extracts each resource from the schema store
3. Upserts into `registry_resources` table
4. Extracts parameters and upserts into `registry_resource_parameters` table

Requires environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Key Concepts

### Stateful vs Stateless Resources
- **Stateful**: CLI tracks state, plugins receive both desired config and current state
- **Stateless**: Plugins determine current state themselves, receive only desired config

### Resource Dependencies
Resources declare dependencies via `dependsOn` array containing resource identifiers.

### Operating System Support
Resources specify OS compatibility:
- `ResourceOs` enum: LINUX | MACOS | WINDOWS
- `LinuxDistro` enum: Comprehensive distro list (debian, ubuntu, fedora, arch, alpine, etc.)
- `OS` enum: Node.js platform values (Darwin | Linux | Windows_NT)

### Sensitive Parameters
Parameters can be marked `isSensitive: true` for secure handling by the CLI.

### Plan Parameter Changes
Plans track changes at parameter level:
- `ParameterOperation`: ADD | REMOVE | MODIFY | NOOP
- Each parameter change includes old/new values

## Important Notes

- **Breaking Changes**: This package is critical infrastructure - maintain backward compatibility
- **Validation**: All schemas must have corresponding tests
- **Documentation**: Include `$comment` fields with documentation URLs in schemas
- **Version Patterns**: Use semantic versioning regex: `^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$`
- **Type Patterns**: Resource types use pattern `^[a-zA-Z][\w-]+$` (alphanumeric start, then alphanumeric/underscore/hyphen)