/**
 * Schema is an interface for representing JDDF schemas.
 *
 * There are a couple rules about how schemas must be formatted that can't be
 * expressed with TypeScript's type system directly. Instead, see
 * `CompiledSchema`, which enforces the correctness of schemas, and provides a
 * type-safe way of taking advantage of this correctness.
 */
export default interface Schema {
  definitions?: { [name: string]: Schema };
  additionalProperties?: boolean;
  ref?: string;
  type?: string;
  enum?: string[];
  elements?: Schema;
  properties?: { [name: string]: Schema };
  optionalProperties?: { [name: string]: Schema };
  values?: Schema;
  discriminator?: { tag: string; mapping: { [name: string]: Schema } };
}

/**
 * isSchema validates whether an arbitrary JSON scalar value appears to be a
 * valid instance of Schema. See the docs for Schema for caveats on what it
 * means to satisfy "Schema" -- not all invariants of JDDF schemas are checked
 * here.
 *
 * This function is relatively expensive, as it walks recursively through the
 * input and performs many type checks.
 *
 * @param schema the potential schema to validate
 */
export function isSchema(schema: any): schema is Schema {
  if (typeof schema !== "object" || schema === null || Array.isArray(schema)) {
    return false;
  }

  if (schema.hasOwnProperty("definitions")) {
    if (typeof schema.definitions !== "object") {
      return false;
    }

    for (const definition of Object.values(schema.definitions)) {
      if (!isSchema(definition)) {
        return false;
      }
    }
  }

  if (schema.hasOwnProperty("additionalProperties")) {
    if (typeof schema.additionalProperties !== "boolean") {
      return false;
    }
  }

  if (schema.hasOwnProperty("ref")) {
    if (typeof schema.ref !== "string") {
      return false;
    }
  }

  if (schema.hasOwnProperty("type")) {
    if (typeof schema.type !== "string") {
      return false;
    }
  }

  if (schema.hasOwnProperty("enum")) {
    if (!Array.isArray(schema.enum)) {
      return false;
    }

    for (const elem of schema.enum) {
      if (typeof elem !== "string") {
        return false;
      }
    }
  }

  if (schema.hasOwnProperty("elements")) {
    if (!isSchema(schema.elements)) {
      return false;
    }
  }

  if (schema.hasOwnProperty("properties")) {
    if (typeof schema.properties !== "object") {
      return false;
    }

    for (const property of Object.values(schema.properties)) {
      if (!isSchema(property)) {
        return false;
      }
    }
  }

  if (schema.hasOwnProperty("optionalProperties")) {
    if (typeof schema.optionalProperties !== "object") {
      return false;
    }

    for (const property of Object.values(schema.optionalProperties)) {
      if (!isSchema(property)) {
        return false;
      }
    }
  }

  if (schema.hasOwnProperty("values")) {
    if (!isSchema(schema.values)) {
      return false;
    }
  }

  if (schema.hasOwnProperty("discriminator")) {
    if (typeof schema.discriminator !== "object") {
      return false;
    }

    if (typeof schema.discriminator.tag !== "string") {
      return false;
    }

    if (typeof schema.discriminator.mapping !== "object") {
      return false;
    }

    for (const mappingValue of Object.values(schema.discriminator.mapping)) {
      if (!isSchema(mappingValue)) {
        return false;
      }
    }
  }

  return true;
}
