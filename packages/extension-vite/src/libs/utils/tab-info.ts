import { ProviderRequestOptions } from "@/types/provider";
import { Tabs } from "webextension-polyfill";
import URL from "url-parse";
export default (tab: Tabs.Tab): ProviderRequestOptions => {
  const domain = tab.url ? new URL(tab.url).hostname : "";
  return {
    domain: domain || "",
    url: tab.url || "",
    faviconURL: tab.favIconUrl || "",
    title: tab.title || "",
    tabId: tab.id || 0,
  };
};
