import schema from './error-response-data-schema.json';
import {describe, expect, it} from 'vitest'
import addFormats from 'ajv-formats';
import Ajv from 'ajv';

const ajv = new Ajv({
  strict: true,
})

addFormats.default(ajv);

describe('Apply request data schema', () => {
  it('compiles', () => {
    ajv.compile(schema);
  })

  it("validates an error message", () => {
    const validate = ajv.compile(schema);
    expect(validate({
      errorType: "unknown",
      message: "This was an error"
    })).to.be.true;
  })
})
