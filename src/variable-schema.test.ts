import schema from './variable-schema.json';
import resourceSchema from './resource-schema.json';
import codifySchema from './schemastore/codify-schema.json';
import { describe, it, expect } from 'vitest'
import Ajv from 'ajv'

const ajv = new Ajv({
  strict: true,
})

describe('Variable schema tests', () => {
  it('compiles', () => {
    ajv.compile(schema);
  })

  it('requires type variable and a name', () => {
    const validator = ajv.compile(schema);
    expect(validator({ type: 'variable', name: 'projectName' })).to.be.true;
    expect(validator({ type: 'variable' })).to.be.false;
    expect(validator({ name: 'projectName' })).to.be.false;
  })

  it('validates the name', () => {
    const validator = ajv.compile(schema);
    expect(validator({ type: 'variable', name: 'site-type_2' })).to.be.true;
    expect(validator({ type: 'variable', name: 'site type' })).to.be.false;
    expect(validator({ type: 'variable', name: 'site.type' })).to.be.false;
    // Reserved for alternatives in conditions
    expect(validator({ type: 'variable', name: 'any' })).to.be.false;
    expect(validator({ type: 'variable', name: 'anything' })).to.be.true;
  })

  it('supports all of the fields', () => {
    const validator = ajv.compile(schema);
    expect(validator({
      type: 'variable',
      name: 'siteType',
      valueType: 'enum',
      options: ['blog', 'landing-page', 'portfolio'],
      default: 'blog',
      label: 'What kind of site are you building?',
      description: 'Each kind comes with its own tools and templates',
      when: { experience: 'advanced' },
    })).to.be.true;

    expect(validator({ type: 'variable', name: 'port', valueType: 'number', default: 3000 })).to.be.true;
    expect(validator({ type: 'variable', name: 'useTs', valueType: 'boolean', default: true })).to.be.true;
    expect(validator({ type: 'variable', name: 'token', sensitive: true })).to.be.true;
    expect(validator({ type: 'variable', name: 'tools', valueType: 'multiEnum', options: ['docker', 'kubectl'], default: ['docker'] })).to.be.true;
    expect(validator({ type: 'variable', name: 'apiName', default: '${{ projectName }}-api' })).to.be.true;
  })

  it('accepts a label with any text (the name stays the identifier)', () => {
    const validator = ajv.compile(schema);
    expect(validator({ type: 'variable', name: 'port', label: 'Which port should the dev server use? (optional)' })).to.be.true;
    expect(validator({ type: 'variable', name: 'port', label: '' })).to.be.false;
    expect(validator({ type: 'variable', name: 'port', label: 3 })).to.be.false;
  })

  it('requires options for enum and multiEnum variables', () => {
    const validator = ajv.compile(schema);
    expect(validator({ type: 'variable', name: 'siteType', valueType: 'enum' })).to.be.false;
    expect(validator({ type: 'variable', name: 'tools', valueType: 'multiEnum' })).to.be.false;
    expect(validator({ type: 'variable', name: 'siteType', valueType: 'enum', options: [] })).to.be.false;
    expect(validator({ type: 'variable', name: 'siteType', valueType: 'enum', options: ['a', 'a'] })).to.be.false;
  })

  it('rejects unknown value types and fields', () => {
    const validator = ajv.compile(schema);
    expect(validator({ type: 'variable', name: 'a', valueType: 'string' })).to.be.false;
    expect(validator({ type: 'variable', name: 'a', title: 'A' })).to.be.false;
  })

  it('is included in the schemastore schema', () => {
    const validator = ajv.compile(codifySchema);
    expect(validator([{ type: 'variable', name: 'siteType', valueType: 'enum', options: ['blog'] }])).to.be.true;
    expect(validator([{ type: 'variable', name: 'siteType', valueType: 'enum' }])).to.be.false;
  })
})

describe('Condition (when) tests', () => {
  const validator = ajv.compile(resourceSchema);
  const valid = (when: unknown) => validator({ type: 'npm', when });

  it('matches values, lists and not', () => {
    expect(valid({ siteType: 'blog' })).to.be.true;
    expect(valid({ port: 3000, useTs: true })).to.be.true;
    expect(valid({ siteType: ['blog', 'portfolio'] })).to.be.true;
    expect(valid({ siteType: { not: 'blog' } })).to.be.true;
    expect(valid({ siteType: { not: ['blog', 'portfolio'] } })).to.be.true;
  })

  it('supports alternatives with any', () => {
    expect(valid({ any: [{ siteType: 'blog' }, { useTs: true, port: 3000 }] })).to.be.true;
    expect(valid({ siteType: 'blog', any: [{ useTs: true }] })).to.be.true;

    expect(valid({ any: [] })).to.be.false;
    expect(valid({ any: [{}] })).to.be.false;
    // Alternatives can't be nested
    expect(valid({ any: [{ any: [{ siteType: 'blog' }] }] })).to.be.false;
  })

  it('rejects invalid conditions', () => {
    expect(valid({})).to.be.false;
    expect(valid({ siteType: [] })).to.be.false;
    expect(valid({ siteType: null })).to.be.false;
    expect(valid({ siteType: { eq: 'blog' } })).to.be.false;
    expect(valid({ siteType: { not: 'blog', has: 'x' } })).to.be.false;
    expect(valid({ 'site type': 'blog' })).to.be.false;
    expect(valid('siteType == blog')).to.be.false;
  })
})
