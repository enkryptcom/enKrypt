import { callRPC } from "./callRPC";
import { getMintTxData } from "./getMintTxData";

export async function sendToSparkAddress(to: string, amount: string) {
  // return await callRPC<string[]>("mintspark", [
  //   {
  //     [to]: { amount: Number(amount) },
  //   },
  // ]);

  const mintTxData = await getMintTxData(to, Number(amount))
  console.log({mintTxData});
}

export async function sendFromSparkAddress(
  to: string,
  amount: string,
  subtractFee = false
): Promise<string> {
  return await callRPC<string>("spendspark", [
    {
      [to]: {
        amount: Number(amount),
        subtractFee,
      },
    },
  ]);
}
