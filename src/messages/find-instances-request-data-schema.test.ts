import schema from './find-instances-request-data-schema.json';
import resourceSchema from '../resource-schema.json'
import { describe, it, expect } from 'vitest'
import Ajv from 'ajv'

const ajv = new Ajv({
  strict: true,
  strictRequired: false,
})
ajv.addSchema(resourceSchema);

describe('Find instances request data schema', () => {
  it('compiles', () => {
    ajv.compile(schema);
  })

  it('Validates correct data', () => {
    const validate = ajv.compile(schema);
    expect(validate({ core: { type: 'alias' } })).to.be.true;
    expect(validate({ core: { type: 'alias', name: 'name' } })).to.be.true;
  })

  it('Errors on incorrect data', () => {
    const validate = ajv.compile(schema);
    expect(validate({ core: {} })).to.be.false;
    expect(validate({})).to.be.false;
  })
})
