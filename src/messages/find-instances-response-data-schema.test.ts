import schema from './find-instances-response-data-schema.json';
import resourceSchema from '../resource-schema.json'
import { describe, it, expect } from 'vitest'
import Ajv from 'ajv'

const ajv = new Ajv({
  strict: true,
  strictRequired: false,
})
ajv.addSchema(resourceSchema);

describe('Find instances response data schema', () => {
  it('compiles', () => {
    ajv.compile(schema);
  })

  it('Validates correct data', () => {
    const validate = ajv.compile(schema);
    expect(validate({
      request: { core: { type: 'alias' } },
      result: [],
    })).to.be.true;
    expect(validate({
      request: { core: { type: 'alias' } },
      result: [
        { core: { type: 'alias' }, parameters: { alias: 'gs', value: 'git status' } },
        { core: { type: 'alias' }, parameters: { alias: 'gp', value: 'git push' } },
      ],
    })).to.be.true;
  })

  it('Errors on incorrect data', () => {
    const validate = ajv.compile(schema);
    expect(validate({})).to.be.false;
    expect(validate({ request: { core: { type: 'alias' } } })).to.be.false;
    expect(validate({
      request: { core: { type: 'alias' } },
      result: [{ core: { type: 'alias' } }],
    })).to.be.false;
  })
})
