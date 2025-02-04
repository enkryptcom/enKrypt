export enum SwapEventType {
  SwapOpen = 'swap_open',
  SwapRate = 'swap_rate',
  SwapVerify = 'swap_verify',
  SwapComplete = 'swap_complete',
  swapFailed = 'swap_failed',
  swapCancelled = 'swap_cancelled',
  swapBack = 'swap_back',
}

export enum GenericEvents {
  login_success = 'successful_login',
  login_error = 'login_error',
}

export enum NetworkType {
  Regular = 'regular',
  Custom = 'custom',
  Testnet = 'testnet',
}

export enum NetworkChangeEvents {
  NetworkChangePopup = 'network_change_popup',
  NetworkChangeAPI = 'network_change_api',
  NetworkTabsClicked = 'network_tabs_clicked',
  NetworkPinnedStatusChanged = 'network_pinned_status_changed',
  NetworkActiveChanged = 'network_active_changed',
  NetworkSortOptionChanged = 'network_sort_option_changed',
  NetworkAddCustomClicked = 'network_add_custom_clicked',
  NetworkCustomNetworkAdded = 'network_custom_network_added',
  NetworkDeleteCustomNetwork = 'network_delete_custom_network',
  NetworkCustomBackButton = 'network_custom_back_button',
}

export enum BuyEventType {
  BuyClick = 'buy_click',
}

export enum SendEventType {
  SendOpen = 'send_open',
  SendVerify = 'send_verify',
  SendAPIVerify = 'send_api_verify',
  SendComplete = 'send_complete',
  SendAPIComplete = 'send_api_complete',
  SendFailed = 'send_failed',
  SendAPIFailed = 'send_api_failed',
  SendApprove = 'send_approve',
  SendDecline = 'send_decline',
  SendAPIApprove = 'send_api_approve',
  SendAPIDecline = 'send_api_decline',
}

export enum NFTEventType {
  NFTOpen = 'nft_open',
}

export enum DAppsEventType {
  DAppsOpen = 'dapps_open',
}

export enum SettingEventType {
  OptOut = 'opt_out',
}

export enum UpdatesEventType {
  UpdatesOpen = 'updates_open',
  UpdatesClosed = 'updates_closed',
}

export enum UpdatesOpenLocation {
  settings = 'settings',
  logo = "logo",
}
