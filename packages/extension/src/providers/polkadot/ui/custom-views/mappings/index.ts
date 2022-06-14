import polkadotMap from "./polkadot";
import acalaMap from "./acala";
import type { MethodMap } from "../types";

const mapping: Record<string, MethodMap> = {
  Polkadot: polkadotMap,
  Acala: acalaMap,
  Karura: acalaMap,
};

export default mapping;
