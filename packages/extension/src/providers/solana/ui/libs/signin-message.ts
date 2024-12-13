import { SolanaSignInInput } from '@solana/wallet-standard-features';

export function createSignInMessageText(input: SolanaSignInInput): string {
  let message = `${input.domain} wants you to sign in with your Solana account:\n`;
  message += `${input.address}`;

  if (input.statement) {
    message += `\n\n${input.statement}`;
  }

  const fields: string[] = [];
  if (input.uri) {
    fields.push(`URI: ${input.uri}`);
  }
  if (input.version) {
    fields.push(`Version: ${input.version}`);
  }
  if (input.chainId) {
    fields.push(`Chain ID: ${input.chainId}`);
  }
  if (input.nonce) {
    fields.push(`Nonce: ${input.nonce}`);
  }
  if (input.issuedAt) {
    fields.push(`Issued At: ${input.issuedAt}`);
  }
  if (input.expirationTime) {
    fields.push(`Expiration Time: ${input.expirationTime}`);
  }
  if (input.notBefore) {
    fields.push(`Not Before: ${input.notBefore}`);
  }
  if (input.requestId) {
    fields.push(`Request ID: ${input.requestId}`);
  }
  if (input.resources) {
    fields.push(`Resources:`);
    for (const resource of input.resources) {
      fields.push(`- ${resource}`);
    }
  }
  if (fields.length) {
    message += `\n\n${fields.join('\n')}`;
  }

  return message;
}

export function createOffChainMessage(message: string) {
  const signingDomain = Buffer.from('\xffsolana offchain', 'ascii');
  const headerversion = Buffer.from([0]);
  const msgFormat = Buffer.from([1]);
  const messageLength = Buffer.alloc(2);
  messageLength.writeUint16LE(message.length);
  const msgBuffer = Buffer.from(message, 'utf8');
  const final = Buffer.concat([
    signingDomain,
    headerversion,
    msgFormat,
    messageLength,
    msgBuffer,
  ]);
  return final;
}
