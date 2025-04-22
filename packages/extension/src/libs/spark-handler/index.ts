import { callRPC } from './callRPC';

export async function sendFromSparkAddress(
  to: string,
  amount: string,
  subtractFee = false,
): Promise<string> {
  return await callRPC<string>('spendspark', [
    {
      [to]: {
        amount: Number(amount),
        subtractFee,
      },
    },
  ]);
}
