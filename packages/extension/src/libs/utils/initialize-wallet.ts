import KeyRing from "@/libs/keyring/keyring";
export default async (mnemonic: string, password: string): Promise<void> => {
  const kr = new KeyRing();
  return kr.init(mnemonic, password);
};
