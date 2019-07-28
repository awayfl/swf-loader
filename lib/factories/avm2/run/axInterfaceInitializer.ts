import { Errors } from "../errors";

/**
 * Throwing initializer for interfaces.
 */
export function axInterfaceInitializer() {
    this.sec.throwError("VerifierError", Errors.NotImplementedError, this.name.name);
  }
  