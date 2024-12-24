import { SparkAccount } from "@/ui/action/types/account";
import { callRPC } from "./callRPC";

export async function getSparkState(): Promise<SparkAccount> {
  const [allAddresses, sparkBalance] = await Promise.all([
    callRPC<Record<number, string>>("getallsparkaddresses"),
    callRPC("getsparkbalance"),
  ]);

  return {
    defaultAddress: Object.values(allAddresses)?.at(-1) ?? "",
    allAddresses: Object.values(allAddresses),
    sparkBalance,
  };
}

export async function generateSparkAddress(): Promise<string> {
  const newSparkAddress = await callRPC<string[]>("getnewsparkaddress");
  return newSparkAddress[0];
}

export async function sendToSparkAddress(to: string, amount: string) {
  return await callRPC<string[]>("mintspark", [
    {
      [to]: { amount: Number(amount) },
    },
  ]);
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
