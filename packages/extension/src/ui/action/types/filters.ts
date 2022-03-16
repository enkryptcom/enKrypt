/* eslint-disable @typescript-eslint/no-namespace */
import {
  currencyFormat,
  formatDuration,
  replaceWithEllipsis,
} from "../utils/filters";
declare global {
  namespace $filters {
    export { currencyFormat, formatDuration, replaceWithEllipsis };
  }
}
