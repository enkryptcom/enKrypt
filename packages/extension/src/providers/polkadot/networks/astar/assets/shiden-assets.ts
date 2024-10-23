import { KnownTokenDisplay } from '@/providers/polkadot/types';
import iconMOVR from './icons/MOVR.png';
import iconKSM from './icons/KSM.png';
import iconKAR from './icons/KAR.svg';

const assets: KnownTokenDisplay[] = [
  {
    name: 'Moonriver',
    symbol: 'MOVR',
    coingeckoID: 'moonriver',
    icon: iconMOVR,
    id: '18446744073709551620',
  },
  {
    name: 'Kusama',
    symbol: 'KSM',
    icon: iconKSM,
    id: '340282366920938463463374607431768211455',
  },
  {
    name: 'Karura',
    symbol: 'KAR',
    icon: iconKAR,
    id: '18446744073709551618',
  },
];

export default assets;
