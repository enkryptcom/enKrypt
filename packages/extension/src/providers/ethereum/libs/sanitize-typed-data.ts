import {
  TypedDataUtils,
  SignTypedDataVersion,
  MessageTypeProperty,
  MessageTypes,
  TypedMessage,
} from "@metamask/eth-sig-util";

const encodeData = (
  primaryType: string,
  data: Record<string, unknown>,
  types: Record<string, MessageTypeProperty[]>,
  version: SignTypedDataVersion.V3 | SignTypedDataVersion.V4
): Record<string, unknown> => {
  const retObject: Record<string, unknown> = {};
  for (const field of types[primaryType]) {
    if (version === SignTypedDataVersion.V3 && data[field.name] === undefined) {
      continue;
    }
    retObject[field.name] = data[field.name];
  }
  return retObject;
};

const sanitizeData = <T extends MessageTypes>(
  typedData: TypedMessage<T>,
  version: SignTypedDataVersion.V3 | SignTypedDataVersion.V4
): Record<string, unknown> => {
  const sanitizedData = TypedDataUtils.sanitizeData(typedData);
  const { domain, types, primaryType, message } = sanitizedData;
  const domainType = { EIP712Domain: sanitizedData.types.EIP712Domain };
  const domainData = encodeData("EIP712Domain", domain, domainType, version);

  if (sanitizedData.primaryType !== "EIP712Domain") {
    const messageData = encodeData(
      primaryType as string,
      message,
      types,
      version
    );
    return {
      domain: domainData,
      message: messageData,
      primaryType,
    };
  }
  return {
    domain: domainData,
    primaryType,
  };
};

export { sanitizeData };
