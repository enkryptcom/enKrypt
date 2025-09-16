import mainnet from './mainnet';
import buildnet from './buildnet';
import { NetworkNames } from '@enkryptcom/types';

export default {
  [NetworkNames.Massa]: mainnet,
  [NetworkNames.MassaBuildnet]: buildnet,
};
