import { Activity } from "@/types/activity";
import { BaseNetwork } from "@/types/base-network";
export default async (
  network: BaseNetwork,
  address: string
): Promise<Activity[]> => {
  console.log("network activity handler", network, address);
  return [];
};
