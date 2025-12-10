import { KnownTokenDisplay } from '@/providers/polkadot/types';
import iconACA from './icons/ACA.png';
import iconDOT from '../../icons/polkadot.webp';
import iconLDOT from './icons/LDOT.png';

const assets: KnownTokenDisplay[] = [
  {
    name: 'Acala',
    symbol: 'ACA',
    coingeckoID: 'acala',
    icon: iconACA,
    id: '18446744073709551616',
  },
  {
    name: 'Polkadot',
    symbol: 'DOT',
    coingeckoID: 'polkadot',
    icon: iconDOT,
    id: '340282366920938463463374607431768211455',
  },
  {
    name: 'Liquid DOT',
    symbol: 'LDOT',
    icon: iconLDOT,
    id: '18446744073709551618',
  },
];

export default assets;
