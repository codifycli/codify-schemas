import schema from './resource-schema.json';
import { describe, it, expect } from 'vitest'
import Ajv from 'ajv'

const ajv = new Ajv({
   strict: true,
})

describe("Resource schema tests", () => {
   it("compiles", () => {
      ajv.compile(schema);
   })

   it("requires a type field to be specified", () => {
      const validate = ajv.compile(schema);
      expect(validate({ type: "type" })).to.be.true;
      expect(validate({})).to.be.false;
   })

   it ("name and type are alpha-numeric and follow variable naming conventions", () => {
      const validate = ajv.compile(schema);
      expect(validate({ type: "a234abcDEF_-"})).to.be.true;
      expect(validate({ type: "234"})).to.be.false;
      expect(validate({ type: "ABCDEF$"})).to.be.false;

      expect(validate({ type: "type", name: "a234abcDEF_-"})).to.be.true;
      expect(validate({ type: "type", name: "0"})).to.be.true;
      expect(validate({ type: "type", name: "[]"})).to.be.false;
      expect(validate({ type: "type", name: "ABCDEF$"})).to.be.false;
   });

   it("dependsOn is an array of unique strings", () => {
      const validate = ajv.compile(schema);
      expect(validate({ type: "type", dependsOn: ["item1", "item2"] })).to.be.true;
      expect(validate({ type: "type", dependsOn: ["item1", "item1"] })).to.be.false;
      expect(validate({ type: "type", dependsOn: "item1" })).to.be.false;
      expect(validate({ type: "type", dependsOn: [6] })).to.be.false;
   })

   it("os supports linux, macOS, and windows", () => {
      const validate = ajv.compile(schema);
      expect(validate({ type: "type", os: ["macOS", "windows", "linux"] })).to.be.true;
      expect(validate({ type: "type", os: ["item1", "item1"] })).to.be.false;
      expect(validate({ type: "type", os: ["macOS"] })).to.be.true;
      expect(validate({ type: "type", os: ["macOS", "macOS"] })).to.be.false;
   })
});
