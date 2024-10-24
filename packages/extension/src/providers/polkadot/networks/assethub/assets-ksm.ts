import { KnownTokenDisplay } from '@/providers/polkadot/types';
import iconRMRK from './icons/rmrk.png';
import iconUSDt from './icons/usdt.png';

const assets: KnownTokenDisplay[] = [
  {
    name: 'RMRK.app',
    symbol: 'RMRK',
    coingeckoID: 'rmrk',
    icon: iconRMRK,
    id: '8',
  },
  {
    name: 'Tether USD',
    symbol: 'USDt',
    coingeckoID: 'tether',
    icon: iconUSDt,
    id: '1984',
  },
];

export default assets;
