import schema from './template-schema.json';
import codifySchema from './schemastore/codify-schema.json';
import { describe, it, expect } from 'vitest'
import Ajv from 'ajv'

const ajv = new Ajv({
  strict: true,
})

describe('Template schema tests', () => {
  it('compiles', () => {
    ajv.compile(schema);
  })

  it('requires type template and a source', () => {
    const validator = ajv.compile(schema);
    expect(validator({ type: 'template', source: 'nvm' })).to.be.true;
    expect(validator({ type: 'template' })).to.be.false;
    expect(validator({ source: 'nvm' })).to.be.false;
    expect(validator({ type: 'resource', source: 'nvm' })).to.be.false;
  })

  it('accepts registry names, profile scoped names and document ids as the source', () => {
    const validator = ajv.compile(schema);
    expect(validator({ type: 'template', source: 'node-setup' })).to.be.true;
    expect(validator({ type: 'template', source: '@codify/node-setup' })).to.be.true;
    expect(validator({ type: 'template', source: '3b241101-e2bb-4255-8caf-4136c566a962' })).to.be.true;

    expect(validator({ type: 'template', source: '' })).to.be.false;
    expect(validator({ type: 'template', source: './local/codify.jsonc' })).to.be.false;
    expect(validator({ type: 'template', source: '/abs/codify.jsonc' })).to.be.false;
    expect(validator({ type: 'template', source: 'https://example.com/template' })).to.be.false;
  })

  it('only accepts exact semver versions', () => {
    const validator = ajv.compile(schema);
    expect(validator({ type: 'template', source: 'nvm', version: '1.2.0' })).to.be.true;
    expect(validator({ type: 'template', source: 'nvm', version: '1.2.0-beta.1' })).to.be.true;

    expect(validator({ type: 'template', source: 'nvm', version: '^1.2.0' })).to.be.false;
    expect(validator({ type: 'template', source: 'nvm', version: 'latest' })).to.be.false;
    expect(validator({ type: 'template', source: 'nvm', version: 1 })).to.be.false;
  })

  it('supports the common resource fields', () => {
    const validator = ajv.compile(schema);
    expect(validator({
      type: 'template',
      name: 'node-setup',
      source: 'nvm',
      dependsOn: ['homebrew'],
      os: ['macOS', 'linux'],
      distro: ['ubuntu'],
    })).to.be.true;

    expect(validator({ type: 'template', source: 'nvm', name: 'invalid name' })).to.be.false;
    expect(validator({ type: 'template', source: 'nvm', os: ['solaris'] })).to.be.false;
  })

  it('does not allow additional properties', () => {
    const validator = ajv.compile(schema);
    expect(validator({ type: 'template', source: 'nvm', plugins: {} })).to.be.false;
    expect(validator({ type: 'template', source: 'nvm', global: '20' })).to.be.false;
  })

  it('is included in the schemastore schema', () => {
    const validator = ajv.compile(codifySchema);
    expect(validator([{ type: 'template', source: 'nvm', version: '1.0.0' }])).to.be.true;
    expect(validator([{ type: 'template' }])).to.be.false;
  })
})
