import * as fs from "fs";
import * as path from "path";
import { compileSchema } from "./CompiledSchema";
import MaxDepthExceededError from "./MaxDepthExceededError";
import Validator, { DEFAULT_VALIDATOR_CONFIG } from "./Validator";
import { isSchema } from "./Schema";

describe("Validator", () => {
  it("supports maxDepth", () => {
    const schema = compileSchema({
      definitions: { a: { ref: "a" } },
      ref: "a",
    });

    const validator = new Validator();
    expect(() => {
      validator.validate(schema, null);
    }).toThrow(new MaxDepthExceededError());
  });

  it("supports maxErrors", () => {
    const schema = compileSchema({ elements: { type: "string" } });

    const validator = new Validator({
      ...DEFAULT_VALIDATOR_CONFIG,
      maxErrors: 3,
    });

    expect(
      validator.validate(schema, [null, null, null, null, null]),
    ).toHaveLength(3);
  });

  describe("spec", () => {
    describe("invalid schemas", () => {
      const contents = fs.readFileSync(
        path.join(__dirname, "../spec/tests/invalid-schemas.json"),
        "utf8",
      );

      for (const { name, schema } of JSON.parse(contents)) {
        it(name, () => {
          if (!isSchema(schema)) {
            return;
          }

          expect(() => {
            compileSchema(schema);
          }).toThrow();
        });
      }
    });

    describe("validation", () => {
      for (const file of fs.readdirSync(
        path.join(__dirname, "../spec/tests/validation"),
      )) {
        describe(file, () => {
          const contents = fs.readFileSync(
            path.join(__dirname, "../spec/tests/validation", file),
            "utf8",
          );
          const tests = JSON.parse(contents);

          for (const { name, schema, instances } of tests) {
            describe(name, () => {
              const validator = new Validator();

              for (const [index, { instance, errors }] of instances.entries()) {
                it(index.toString(), () => {
                  const actualErrors = validator
                    .validate(compileSchema(schema), instance)
                    .map(err => ({
                      instancePath: err.instancePath.map(p => `/${p}`).join(""),
                      schemaPath: err.schemaPath.map(p => `/${p}`).join(""),
                    }));

                  actualErrors.sort((a, b) =>
                    `${a.schemaPath}:${a.instancePath}` <
                    `${b.schemaPath}:${b.instancePath}`
                      ? -1
                      : 1,
                  );

                  errors.sort((a: any, b: any) =>
                    `${a.schemaPath}:${a.instancePath}` <
                    `${b.schemaPath}:${b.instancePath}`
                      ? -1
                      : 1,
                  );

                  expect(actualErrors).toEqual(errors);
                });
              }
            });
          }
        });
      }
    });
  });
});
