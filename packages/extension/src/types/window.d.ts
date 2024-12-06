interface Window {
  [key: string]: any;
  __ENKRYPT_DEBUG_LOG_CONF__: undefined | string
}

declare global {
  var __ENKRYPT_DEBUG_LOG_CONF__: undefined | string
}

// Required to make the `delare global` exports work for some reason
export { }

