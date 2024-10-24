import { KnownTokenDisplay } from '@/providers/polkadot/types';
import iconUSDC from './icons/usdc.png';
import iconUSDT from './icons/usdt.png';
import iconDED from './icons/ded.png';

const assets: KnownTokenDisplay[] = [
  {
    name: 'USD Coin',
    symbol: 'USDC',
    coingeckoID: 'usd-coin',
    icon: iconUSDC,
    id: '1337',
  },
  {
    name: 'Tether USD',
    symbol: 'USDt',
    coingeckoID: 'tether',
    icon: iconUSDT,
    id: '1984',
  },
  {
    name: 'DOT is Dead',
    symbol: 'DED',
    icon: iconDED,
    id: '30',
  },
];

export default assets;
