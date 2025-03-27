import { KnownTokenDisplay } from '@/providers/polkadot/types';
import iconACA from './icons/ACA.png';
import iconDOT from '../../icons/polkadot.webp';
import iconLcDOT from './icons/LCDOT.png';
import iconLDOT from './icons/LDOT.png';
import iconAUSD from './icons/AUSD.png';

const assets: KnownTokenDisplay[] = [
  {
    name: 'Acala',
    symbol: 'ACA',
    coingeckoID: 'acala',
    icon: iconACA,
  },
  {
    name: 'Polkadot',
    symbol: 'DOT',
    coingeckoID: 'polkadot',
    icon: iconDOT,
  },
  {
    name: 'Crowdloan DOT',
    symbol: 'lcDOT',
    coingeckoID: 'polkadot',
    icon: iconLcDOT,
  },
  {
    name: 'Acala Dollar',
    symbol: 'aUSD',
    icon: iconAUSD,
    coingeckoID: 'acala-dollar',
  },
  {
    name: 'Liquid DOT',
    symbol: 'LDOT',
    icon: iconLDOT,
  },
];

export default assets;
