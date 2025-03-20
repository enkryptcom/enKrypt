
/* eslint-disable @typescript-eslint/no-namespace */
import {
  formatDuration,
  replaceWithEllipsis,
  formatFiatValue,
  formatFloatingPointValue,
  truncate,
  parseCurrency
} from '../utils/filters';
declare global {
  namespace $filters {
    export {
      formatDuration,
      replaceWithEllipsis,
      formatFiatValue,
      formatFloatingPointValue,
      truncate,
      parseCurrency
    };
  }
}
