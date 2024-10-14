import { UnwrapNestedRefs, Ref } from "vue";
import { ProviderRequestOptions, ProviderRPCRequest } from "@/types/provider";
import { InternalOnMessageResponse } from "@/types/messenger";
import type PublicKeyRing from "@/libs/keyring/public-keyring";
import { RPCRequestType } from "@enkryptcom/types";
import { RouteRecordRaw } from "vue-router";
export interface WindowPromiseType {
  Resolve: Ref<(res: InternalOnMessageResponse) => void>;
  options: UnwrapNestedRefs<ProviderRequestOptions>;
  Request: Ref<ProviderRPCRequest>;
  KeyRing: PublicKeyRing;
  sendToBackground: (req: RPCRequestType) => Promise<InternalOnMessageResponse>;
}

export interface RoutesType {
  [key: string]: RouteRecordRaw;
}

export interface DAppsItem {
  title: string;
  link: string;
  description?: string;
  isFavorites: boolean;
  image: string;
}
