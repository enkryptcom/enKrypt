export enum SwapEventType {
  SwapOpen = "swap_open",
  SwapRate = "swap_rate",
  SwapVerify = "swap_verify",
  SwapComplete = "swap_complete",
  swapFailed = "swap_failed",
}

export enum NetworkChangeEvents {
  NetworkChangePopup = "network_change_popup",
  NetworkChangeAPI = "network_change_api",
}

export enum BuyEventType {
  BuyClick = "buy_click",
}

export enum SendEventType {
  SendOpen = "send_open",
  SendVerify = "send_verify",
  SendComplete = "send_complete",
  SendFailed = "send_failed",
}

export enum NFTEventType {
  NFTOpen = "nft_open",
}

export enum DAppsEventType {
  DAppsOpen = "dapps_open",
}
