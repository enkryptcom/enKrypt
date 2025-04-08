import { KnownTokenDisplay } from '@/providers/polkadot/types';
import iconKAR from '../../icons/karura.webp';
import iconAUSD from './icons/AUSD.png';
import iconKSM from './icons/KSM.png';
import iconLKSM from './icons/LKSM.png';
import iconBNC from './icons/BNC.png';
import iconKINT from './icons/KINT.png';
import iconPHA from './icons/PHA.png';
import iconCRAB from './icons/CRAB.png';
import iconCSM from './icons/CSM.png';
import iconGENS from './icons/GENS.png';
import iconKBTC from './icons/KBTC.png';
import iconKMA from './icons/KMA.png';
import iconMOVR from './icons/MOVR.png';
import iconQTZ from './icons/QTZ.png';
import iconTEER from './icons/TEER.png';
import iconUSDT from './icons/USDT.png';
import iconAIR from './icons/AIR.png';
import iconARIS from './icons/ARIS.png';
import iconTUR from './icons/TUR.png';
import iconNEER from './icons/NEER.png';
import iconKICO from './icons/KICO.png';
import iconHKO from './icons/HKO.png';
import iconRMRK from './icons/RMRK.png';
import iconBSX from './icons/BSX.png';
import iconTAI from './icons/TAI.png';
import iconTaiKSM from './icons/taiKSM.png';

const assets: KnownTokenDisplay[] = [
  {
    name: 'Karura',
    symbol: 'KAR',
    icon: iconKAR,
    coingeckoID: 'karura',
  },
  {
    name: 'Acala Dollar',
    symbol: 'aUSD',
    icon: iconAUSD,
    coingeckoID: 'acala-dollar',
  },
  {
    name: 'Kusama',
    symbol: 'KSM',

    icon: iconKSM,
    coingeckoID: 'kusama',
  },
  {
    name: 'Liquid KSM',
    symbol: 'LKSM',
    icon: iconLKSM,
  },
  {
    name: 'Bifrost',
    symbol: 'BNC',
    icon: iconBNC,
    coingeckoID: 'bifrost-native-coin',
  },
  {
    name: 'Kintsugi',
    symbol: 'KINT',
    icon: iconKINT,
    coingeckoID: 'kintsugi',
  },
  {
    name: 'Phala',
    symbol: 'PHA',
    icon: iconPHA,
    coingeckoID: 'pha',
  },
  {
    name: 'Crab',
    symbol: 'CRAB',
    icon: iconCRAB,
    coingeckoID: 'darwinia-crab-network-native-token',
  },
  {
    name: 'Crust Shadow',
    symbol: 'CSM',
    icon: iconCSM,
    coingeckoID: 'crust-shadow',
  },
  {
    name: 'Genshiro',
    symbol: 'GEN',
    icon: iconGENS,
    coingeckoID: 'genshiro',
  },
  {
    name: 'Kintsugi Wrapped BTC',
    symbol: 'KBTC',
    icon: iconKBTC,
    coingeckoID: 'bitcoin',
  },
  {
    name: 'Calamari',
    symbol: 'KMA',
    icon: iconKMA,
    coingeckoID: 'calamari-network',
  },
  {
    name: 'Moonriver',
    symbol: 'MOVR',
    icon: iconMOVR,
    coingeckoID: 'moonriver',
  },
  {
    name: 'Quartz',
    symbol: 'QTZ',
    icon: iconQTZ,
    coingeckoID: 'quartz',
  },
  {
    name: 'Integritee',
    symbol: 'TEER',
    icon: iconTEER,
    coingeckoID: 'integritee',
  },
  {
    name: 'Tether',
    symbol: 'USDT',
    icon: iconUSDT,
    coingeckoID: 'tether',
  },

  {
    name: 'Altair',
    symbol: 'AIR',
    icon: iconAIR,
    coingeckoID: 'altair',
  },
  {
    name: 'PolarisDAO',
    symbol: 'ARIS',
    icon: iconARIS,
  },
  {
    name: 'Turing',
    symbol: 'TUR',
    icon: iconTUR,
  },
  {
    name: 'Metaverse.Network',
    symbol: 'NEER',
    icon: iconNEER,
  },

  {
    name: 'Kico',
    symbol: 'KICO',
    icon: iconKICO,
  },
  {
    name: 'Heiko',
    symbol: 'HKO',
    icon: iconHKO,
  },
  {
    name: 'RMRK',
    symbol: 'RMRK',
    icon: iconRMRK,
    coingeckoID: 'rmrk',
  },
  {
    name: 'Basilisk',
    symbol: 'BSX',
    icon: iconBSX,
  },
  {
    name: 'Taiga',
    symbol: 'TAI',
    icon: iconTAI,
  },
  {
    name: 'Taiga KSM',
    symbol: 'taiKSM',
    icon: iconTaiKSM,
    coingeckoID: 'kusama',
  },
];

export default assets;
