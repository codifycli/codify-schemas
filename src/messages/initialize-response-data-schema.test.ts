import schema from './initialize-response-data-schema.json';
import {describe, expect, it} from 'vitest'
import Ajv from 'ajv'

const ajv = new Ajv({
  strict: true,
})

describe('Get resources response data schema', () => {
  it('compiles', () => {
    ajv.compile(schema);
  })

  it("requires type and dependencies to be defined", () => {
    const validate = ajv.compile(schema);
    expect(validate({
      resourceDefinitions: [
        {
          type: 'typeA',
          dependencies: ['typeB']
        },
        {
          type: 'typeB',
          dependencies: [],
          sensitiveParameters: ['paramA', 'paramB'],
        }
      ]
    })).to.be.true;

    expect(validate({
      resourceDefinitions: [
        {
          dependencies: ['typeB']
        },
        {
          type: 'typeB',
        }
      ]
    })).to.be.false;
  });

  it('accepts supersededBy', () => {
    const validate = ajv.compile(schema);
    expect(validate({
      resourceDefinitions: [
        { type: 'alias', dependencies: [], supersededBy: 'aliases' },
        { type: 'aliases', dependencies: [] },
      ]
    })).to.be.true;

    expect(validate({
      resourceDefinitions: [
        { type: 'alias', dependencies: [], supersededBy: ['aliases'] },
      ]
    })).to.be.false;
  });

  it('accepts requires', () => {
    const validate = ajv.compile(schema);
    expect(validate({
      resourceDefinitions: [
        { type: 'cursor', dependencies: [], requires: ['homebrew'] },
        { type: 'homebrew', dependencies: [], requires: [] },
        { type: 'alias', dependencies: [] },
      ]
    })).to.be.true;

    expect(validate({
      resourceDefinitions: [
        { type: 'cursor', dependencies: [], requires: 'homebrew' },
      ]
    })).to.be.false;
  });

})
