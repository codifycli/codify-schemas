import schema from './set-verbosity-request-data-schema.json';
import {describe, expect, it} from 'vitest'
import Ajv from 'ajv'

const ajv = new Ajv({
  strict: true,
})

describe('Set Verbosity Request Data Schema', () => {
  it('compiles', () => {
    ajv.compile(schema);
  })

  it("Sets a verbosity level", () => {
    const validate = ajv.compile(schema);
    expect(validate({
      verbosityLevel: 2,
    })).to.be.true;
  })
})
