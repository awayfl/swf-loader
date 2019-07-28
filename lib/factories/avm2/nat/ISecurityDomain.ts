import { AXSecurityDomain } from "../run/AXSecurityDomain";
import { GenericVector } from "../natives/GenericVector";
import { Int32Vector } from "../natives/int32Vector";
import { Float64Vector } from "../natives/float64Vector";
import { Uint32Vector } from "../natives/uint32Vector";

export interface ISecurityDomain extends AXSecurityDomain {
    ObjectVector: typeof GenericVector;
    Int32Vector: typeof Int32Vector;
    Uint32Vector: typeof Uint32Vector;
    Float64Vector: typeof Float64Vector;
  }