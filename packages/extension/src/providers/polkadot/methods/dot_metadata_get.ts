import { MiddlewareFunction } from "@enkryptcom/types";
import SubstrateProvider from "..";
import MetadataStorage from "../libs/metadata-storage";
const method: MiddlewareFunction = function (
  this: SubstrateProvider,
  payload,
  res,
  next
): void {
  if (payload.method !== "dot_metadata_get") return next();
  else {
    const mstorage = new MetadataStorage();
    mstorage.getAllMetadata().then((allMeta) => {
      const response = Object.keys(allMeta).map((key) => {
        return {
          genesisHash: key,
          specVersion: allMeta[key].specVersion,
        };
      });
      return res(null, response);
    });
  }
};
export default method;
