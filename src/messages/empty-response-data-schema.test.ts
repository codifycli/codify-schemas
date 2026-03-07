import schema from './empty-response-data-schema.json';
import {describe, expect, it} from 'vitest'
import Ajv from 'ajv'

const ajv = new Ajv({
  strict: true,
})

describe('Empty Response Data Schema', () => {
  it('compiles', () => {
    ajv.compile(schema);
  })

  it("Only empty object", () => {
    const validate = ajv.compile(schema);
    expect(validate(null)).to.be.true;
  })
})
