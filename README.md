# jddf.js [![npm](https://img.shields.io/npm/v/@jddf/jddf.svg)](https://www.npmjs.com/package/@jddf/jddf)

This package is a JavaScript implementation of **JSON Data Definition Format**.
You can use it to:

1. Validate input data is valid against a schema,
2. Get a list of validation errors with that input data, or
3. Build your own custom tooling on top of JSON Data Definition Format.

This package is written in TypeScript, and works in browsers and Node.js alike.

## Usage

Here's how you can use this package to validate inputted data:

```typescript
import { compileSchema, Validator } from "@jddf/jddf";

// compileSchema does basic validation on your schema, to make sure it's sane.
// Plus, if you're using TypeScript, it will give you basic typechecking.
const schema = compileSchema({
  properties: {
    name: { type: "string" },
    age: { type: "number" },
    phones: {
      elements: {
        type: "string",
      },
    },
  },
});

// Once you've registered all your schemas, you can efficiently validate as many
// inputs as desired.
const validator = new Validator();

// Validator.validate returns an array of validation errors. By default, all
// errors are returned, but you can also configure Validator to limit how many
// errors it produces.
const errorsOk = validator.validate({
  name: "John Doe",
  age: 43,
  phones: ["+44 1234567", "+44 2345678"],
});

// We're not expecting any errors here.
console.log(errorsOk); // []

// Each returned error holds paths to the bad part of the input, as well as the
// part of the schema which rejected it.
const errorsBad = validator.validate({
  age: "43",
  phones: ["+44 1234567", 442345678],
});

// "name" is required
console.log(errorsBad[0].instancePath.toString()); // ""
console.log(errorsBad[0].schemaPath.toString()); // "/properties/name"

// "age" has the wrong type
console.log(errorsBad[1].instancePath.toString()); // "/age"
console.log(errorsBad[1].schemaPath.toString()); // "/properties/age/type"

// "phones[1]" has the wrong type
console.log(errorsBad[2].instancePath.toString()); // "/phones/1"
console.log(errorsBad[2].schemaPath.toString()); // "/properties/phones/elements/type"
```

In the example above, those errors are standardized; every implementation of
JDDF would have produced the exact same errors, so you can reliably transmit
these errors to any other system that uses JDDF.
