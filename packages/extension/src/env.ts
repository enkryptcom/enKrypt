const forbiddenProtocols = [
  'chrome-extension://',
  'chrome-search://',
  'chrome://',
  'devtools://',
  'edge://',
  'https://chrome.google.com/webstore',
]

export const isForbiddenUrl = (url: string): boolean => forbiddenProtocols.some(protocol => url.startsWith(protocol))


export const isFirefox = navigator.userAgent.includes('Firefox')
