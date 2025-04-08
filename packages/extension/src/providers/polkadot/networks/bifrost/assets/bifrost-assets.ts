import { KnownTokenDisplay } from '@/providers/polkadot/types';
import iconBNC from './icons/BNC.png';
import iconAUSD from './icons/AUSD.png';
import iconMOVR from './icons/MOVR.png';
import iconKAR from './icons/KAR.png';
import iconRMRK from './icons/RMRK.png';
import iconZLK from './icons/ZLK.png';
import iconUSDT from './icons/USDT.png';
import iconTUR from './icons/TUR.png';
import iconCRAB from './icons/CRAB.png';
import iconDOT from '../../icons/polkadot.webp';
import iconKSM from '../../icons/kusama.webp';

const assets: KnownTokenDisplay[] = [
  {
    name: 'Bifrost',
    symbol: 'BNC',
    coingeckoID: 'bifrost-native-coin',
    icon: iconBNC,
  },
  {
    name: 'Polkadot',
    symbol: 'DOT',
    coingeckoID: 'polkadot',
    icon: iconDOT,
  },
  {
    name: 'Kusama',
    symbol: 'KSM',
    coingeckoID: 'kusama',
    icon: iconKSM,
  },
  {
    name: 'Acala Dollar',
    symbol: 'aUSD',
    icon: iconAUSD,
    coingeckoID: 'acala-dollar',
  },
  {
    name: 'Moonriver',
    symbol: 'MOVR',
    icon: iconMOVR,
    coingeckoID: 'moonriver',
  },
  {
    name: 'Karura',
    symbol: 'KAR',
    icon: iconKAR,
    coingeckoID: 'karura',
  },
  {
    name: 'RMRK',
    symbol: 'RMRK',
    icon: iconRMRK,
    coingeckoID: 'rmrk',
  },
  {
    name: 'Zenlink',
    symbol: 'ZLK',
    icon: iconZLK,
    coingeckoID: 'zenlink-network-token',
  },
  {
    name: 'USDT',
    symbol: 'USDT',
    icon: iconUSDT,
    coingeckoID: 'usdt',
  },
  {
    name: 'Turing Network',
    symbol: 'TUR',
    icon: iconTUR,
    coingeckoID: '',
  },
  {
    name: 'Darwinia Crab',
    symbol: 'CRAB',
    icon: iconCRAB,
    coingeckoID: '',
  },
];

export default assets;
