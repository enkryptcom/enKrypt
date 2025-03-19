import { KnownTokenDisplay } from '@/providers/polkadot/types';
import iconPen from '../icons/PEN.png';
import iconAmp from '../icons/AMPE.png';
import iconDot from '../../icons/polkadot.webp';
import iconKsm from '../../icons/kusama.webp';

const assets: KnownTokenDisplay[] = [
  {
    name: 'Pendulum',
    symbol: 'PEN',
    coingeckoID: 'pendulum',
    icon: iconPen,
  },
  {
    name: 'Amplitude',
    symbol: 'AMPE',
    icon: iconAmp,
  },
  {
    name: 'Polkadot',
    symbol: 'DOT',
    coingeckoID: 'polkadot',
    icon: iconDot,
  },
  {
    name: 'Kusama',
    symbol: 'KSM',
    coingeckoID: 'kusama',
    icon: iconKsm,
  },
];

export default assets;
