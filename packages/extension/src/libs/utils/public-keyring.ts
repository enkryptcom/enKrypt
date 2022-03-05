import { KeyRecord, SignerType } from "@enkryptcom/types";
import KeyRingBase from "./keyring-base";
class PublicKeyRing extends KeyRingBase {
  constructor() {
    super();
  }
  async getAccounts(types?: Array<SignerType>): Promise<Array<KeyRecord>> {
    return this.getKeysArray().then((records) => {
      return types ? records.filter((r) => types.includes(r.type)) : records;
    });
  }
}
export default PublicKeyRing;
