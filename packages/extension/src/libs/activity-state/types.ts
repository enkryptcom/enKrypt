import { Activity } from "@/types/activity";
import { BaseNetwork } from "@/types/base-network";

export interface ActivityOptions {
  address: string;
  network: string;
}

export type ActivityHandlerType = (
  _network: BaseNetwork,
  _address: string
) => Promise<Activity[]>;
