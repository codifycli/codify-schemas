import schema from './get-resource-info-response-data-schema.json';
import { describe, it, expect } from 'vitest'
import Ajv from 'ajv'
import {GetResourceInfoResponseData} from "../types/index.js";

const ajv = new Ajv({
  strict: true,
})

describe('Get resources response data schema', () => {
  it('compiles', () => {
    ajv.compile(schema);
  })

  it("Validates a correct response", () => {
    const validate = ajv.compile(schema);
    expect(validate({
      type: 'type',
      plugin: 'core-plugin',
      schema: {
        "$schema": "http://json-schema.org/draft-07/schema",
        "$id": "https://www.codifycli.com/get-resource-schema-data-schema.json",
        "title": "Get Resource Schema",
        "type": "object",
        "properties": {
          "plugin": {
            "type": "string",
            "description": "The plugin the resource is from"
          },
          "type": {
            "type": "string",
            "description": "The id/type of the resource"
          },
          "schema": {
            "type": "object",
            "description": "The JSON Schema validation schema for the resource."
          },
          "dependencies": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
        },
        dependencies: [
          "typeA",
          "typeB"
        ],

      },
      import: {
        requiredParameters: ['plugin'],
      },
      importAndDestroy: {
        preventImport: true,
        requiredParameters: ['plugin']
      },
      allowMultiple: true,
      sensitiveParameters: [],
    })).to.be.true;

    // For testing the typescript type
    const a: GetResourceInfoResponseData = {
      type: 'type',
      plugin: 'core-plugin',
      schema: {
        "$schema": "http://json-schema.org/draft-07/schema",
        "$id": "https://www.codifycli.com/get-resource-schema-data-schema.json",
        "title": "Get Resource Schema",
        "type": "object",
        "properties": {
          "plugin": {
            "type": "string",
            "description": "The plugin the resource is from"
          },
          "type": {
            "type": "string",
            "description": "The id/type of the resource"
          },
          "schema": {
            "type": "object",
            "description": "The JSON Schema validation schema for the resource."
          },
          "dependencies": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        dependencies: [
          "typeA",
          "typeB"
        ]
      },
      import: {
        requiredParameters: ['plugin'],
      },
      importAndDestroy: {
        preventImport: true,
        requiredParameters: ['plugin'],
      },
      allowMultiple: false,
    }
  })

  it("Rejects an invalid response", () => {
    const validate = ajv.compile(schema);
    expect(validate({
      schema: {
        "$schema": "http://json-schema.org/draft-07/schema",
        "$id": "https://www.codifycli.com/get-resource-schema-data-schema.json",
        "title": "Get Resource Schema",
        "type": "object",
        "properties": {
          "plugin": {
            "type": "string",
            "description": "The plugin the resource is from"
          },
          "type": {
            "type": "string",
            "description": "The id/type of the resource"
          },
          "schema": {
            "type": "object",
            "description": "The JSON Schema validation schema for the resource."
          },
          "dependencies": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "sensitiveProperties": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      }
    })).to.be.false;

    expect(validate({
      type: 'type',
      plugin: 'core-plugin',
      allowMultiple: {}
    })).to.be.false;
  })

})
