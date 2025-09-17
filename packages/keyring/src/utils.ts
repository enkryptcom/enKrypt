import { SignerType } from "@enkryptcom/types";

export const pathParser = (
  basePath: string,
  index: number,
  type: SignerType,
): string => {
  if (
    [SignerType.ecdsa, SignerType.ed25519, SignerType.sr25519].includes(type) &&
    basePath === "//"
  ) {
    return index === 0 ? "" : `//${--index}`; // polkadotjs extension use "" for 0 index/root
  }
  if (type === SignerType.ed25519sol) {
    return `${basePath}/${index}'/0`; // Solana uses hardened paths
  }
  if (type === SignerType.ed25519mas) {
    return `${basePath}/${index}'/0'`; // Massa uses hardened paths with BIP-44 coin type 632
  }
  return `${basePath}/${index}`;
};
