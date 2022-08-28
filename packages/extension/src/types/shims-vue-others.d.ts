import { UNSResolver } from "@/libs/utils/uns";
import * as filters from "@action/utils/filters";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $filters: filters;
    $domainResolver: UNSResolver;
  }
}
