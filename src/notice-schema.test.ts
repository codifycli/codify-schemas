import schema from './notice-schema.json';
import codifySchema from './schemastore/codify-schema.json';
import { describe, it, expect } from 'vitest'
import Ajv from 'ajv'

const ajv = new Ajv({
  strict: true,
})

describe('Notice schema tests', () => {
  it('compiles', () => {
    ajv.compile(schema);
  })

  it('requires type notice and a message', () => {
    const validator = ajv.compile(schema);
    expect(validator({ type: 'notice', message: 'Run npm run dev to start' })).to.be.true;
    expect(validator({ type: 'notice' })).to.be.false;
    expect(validator({ type: 'notice', message: '' })).to.be.false;
    expect(validator({ message: 'Run npm run dev to start' })).to.be.false;
  })

  it('supports all of the fields', () => {
    const validator = ajv.compile(schema);
    expect(validator({
      type: 'notice',
      name: 'getting-started',
      title: 'Getting started with your Astro site',
      message: '1. cd ${{ projectDir }}\n2. npm i\n3. npm run dev',
      level: 'success',
      stage: 'apply',
      show: 'always',
      dependsOn: ['template.astro-blog'],
      os: ['macOS', 'linux'],
      distro: ['ubuntu'],
      when: { siteType: 'blog', any: [{ useTs: true }, { tools: ['docker'] }] },
    })).to.be.true;
  })

  it('validates the enums', () => {
    const validator = ajv.compile(schema);
    expect(validator({ type: 'notice', message: 'a', level: 'error' })).to.be.false;
    expect(validator({ type: 'notice', message: 'a', stage: 'destroy' })).to.be.false;
    expect(validator({ type: 'notice', message: 'a', show: 'never' })).to.be.false;
    expect(validator({ type: 'notice', message: 'a', os: ['darwin'] })).to.be.false;
  })

  it('only allows show for stage apply', () => {
    const validator = ajv.compile(schema);
    expect(validator({ type: 'notice', message: 'a', stage: 'plan', level: 'warning' })).to.be.true;
    expect(validator({ type: 'notice', message: 'a', stage: 'plan', show: 'always' })).to.be.false;
    expect(validator({ type: 'notice', message: 'a', show: 'always' })).to.be.true;
  })

  it('does not allow unknown properties', () => {
    const validator = ajv.compile(schema);
    expect(validator({ type: 'notice', message: 'a', text: 'b' })).to.be.false;
    expect(validator({ type: 'notice', message: 'a', name: 'has space' })).to.be.false;
  })

  it('is in the schemastore schema', () => {
    const validator = ajv.compile(codifySchema);
    expect(validator([{ type: 'notice', message: 'Run npm run dev to start', level: 'info' }])).to.be.true;
    expect(validator([{ type: 'notice', message: 'a', stage: 'plan', show: 'always' }])).to.be.false;
    expect(validator([{ type: 'notice' }])).to.be.false;
  })
})
