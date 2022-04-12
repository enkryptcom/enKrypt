import { SignerType } from "@enkryptcom/types";

const getOtherSigners = (signers: SignerType[]): SignerType[] => {
  const otherSigners: SignerType[] = [];
  Object.values(SignerType).forEach((_signer) => {
    if (!signers.includes(_signer)) otherSigners.push(_signer);
  });
  return otherSigners;
};

export { getOtherSigners };
