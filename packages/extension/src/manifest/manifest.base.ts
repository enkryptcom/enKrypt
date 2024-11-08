import packageJson from '../../package.json';

const { version } = packageJson;

export default {
  homepage_url: 'https://www.enkrypt.com',
  version,
  name: 'Enkrypt: ETH, BTC and Solana Wallet',
  short_name: 'Enkrypt',
  description: 'The best multichain crypto wallet',
  permissions: [
    'storage',
    'unlimitedStorage',
    'tabs',
    'clipboardRead',
    'clipboardWrite',
  ],
  action: {
    default_icon: {
      '16': 'assets/img/icons/icon16.png',
      '32': 'assets/img/icons/icon32.png',
      '64': 'assets/img/icons/icon64.png',
      '192': 'assets/img/icons/icon192.png',
    },
    default_title: 'Enkrypt',
    default_popup: 'action.html',
  },
  content_scripts: [],
  icons: {
    16: 'assets/img/icons/icon16.png',
    32: 'assets/img/icons/icon32.png',
    64: 'assets/img/icons/icon64.png',
    192: 'assets/img/icons/icon192.png',
  },
};
