import ecash from './ecash-base';
import ecashTest from './ecash-testnet';
import { NetworkNames } from '@enkryptcom/types';

export default {
  [NetworkNames.ECash]: ecash,
  [NetworkNames.ECashTest]: ecashTest,
};
