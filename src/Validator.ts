import CompiledSchema from "./CompiledSchema";
import Vm from "./Vm";

export default class Validator {
  private config: ValidatorConfig;

  constructor(config?: ValidatorConfig) {
    this.config = config || DEFAULT_VALIDATOR_CONFIG;
  }

  public validate(schema: CompiledSchema, instance: any): ValidationError[] {
    return Vm.validate(
      this.config.maxErrors,
      this.config.maxDepth,
      schema,
      instance,
    );
  }
}

export interface ValidatorConfig {
  maxDepth: number;
  maxErrors: number;
}

export const DEFAULT_VALIDATOR_CONFIG = {
  maxDepth: 32,
  maxErrors: 0,
};

export interface ValidationError {
  instancePath: string[];
  schemaPath: string[];
}
