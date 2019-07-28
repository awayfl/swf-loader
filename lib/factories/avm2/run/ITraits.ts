import { RuntimeTraits } from "../abc/lazy/RuntimeTraits";
import { AXSecurityDomain } from "./AXSecurityDomain";

/**
 * All objects with Traits must implement this interface.
 */
export interface ITraits {
    traits: RuntimeTraits;
    sec: AXSecurityDomain;
  }