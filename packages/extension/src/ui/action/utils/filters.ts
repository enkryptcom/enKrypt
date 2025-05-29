import { BigNumber } from 'bignumber.js';
import moment from 'moment';
import { LANG_INFO } from './currencyConfig';
import {
  formatFiatValue,
  formatFloatingPointValue,
} from '@/libs/utils/number-formatter';
import { useCurrencyStore } from '../views/settings/store';
export const replaceWithEllipsis = (
  value: string,
  keepLeft: number,
  keepRight: number,
): string => {
  if (!value) return '';
  value = value.toString();
  return (
    value.substring(0, keepLeft) +
    '...' +
    value.substring(value.length - keepRight, value.length)
  );
};

export const parseCurrency = (value: string | number): string => {
  const raw = value.toString().replace(/[,<]/g, '');
  const store = useCurrencyStore();
  const currency = store.currentSelectedCurrency;
  const locale = LANG_INFO[currency as keyof typeof LANG_INFO]?.locale || 'en-US';
  const exchangeRate = store.currencyList.find(c => c.fiat_currency === currency)?.exchange_rate || 1;

  const amount = new BigNumber(raw);
  const finalValue = amount.isNaN() || amount.isZero() ? 0 : amount.times(exchangeRate).toNumber();
  const notation = BigNumber(finalValue).gt(999999) ? 'compact' : 'standard';
  return `${amount.lt(0.0000001) && amount.gt(0) ? '< ' : ''}${new Intl.NumberFormat(locale, { style: 'currency', currency: currency, notation, }).format(finalValue)}`
};

export const truncate = (value: string, length: number): string => {
  if (!value) return '';
  value = value.toString();
  return value.length > length ? value.substring(0, length) + '...' : value;
};

export const formatDuration = (
  duration: moment.Duration,
  date: number,
): string => {
  if (duration.days() < 0) return moment(date).fromNow();

  const isoString = moment.duration(duration.asMilliseconds()).toISOString();
  const [, , h = '', , m = '', , s = ''] =
    isoString.match(/T((\d+)H)?((\d+)M)?(([\d]+)(\.(\d+))?S)?/) ?? [];

  if (duration.hours() < 0)
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')} `;

  return `${m.padStart(2, '0')}:${s.padStart(2, '0')} `;
};
export { formatFiatValue, formatFloatingPointValue };
