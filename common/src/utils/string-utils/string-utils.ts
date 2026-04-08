import { MathUtils } from '../math-utils/math-utils';

export function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

export type Rounding = number | 'floor' | 'ceil';
export function compactNumber(num: number, rounding?: Rounding) {
  if (num < 1000) {
    let rounded: number;
    let decimals: number;
    if (rounding === 'floor') {
      rounded = MathUtils.floor(num, 1);
      decimals = 1;
    } else if (rounding === 'ceil') {
      rounded = MathUtils.ceil(num, 1);
      decimals = 1;
    } else if (typeof rounding === 'number') {
      rounded = MathUtils.round(num, rounding);
      decimals = rounding;
    } else {
      rounded = MathUtils.round(num, 1);
      decimals = 1;
    }
    return rounded.toFixed(decimals).replace(/\.0+$/, '');
  }

  const divisor = num >= 1000000 ? 1000000 : 1000;
  const suffix = num >= 1000000 ? 'M' : 'K';
  const divided = num / divisor;

  let rounded: number;
  if (rounding === 'floor') {
    rounded = MathUtils.floor(divided, 1);
  } else if (rounding === 'ceil') {
    rounded = MathUtils.ceil(divided, 1);
  } else if (typeof rounding === 'number') {
    rounded = MathUtils.round(divided, rounding);
  } else {
    rounded = MathUtils.round(divided, 1);
  }

  return rounded.toFixed(1).replace(/\.0$/, '') + suffix;
}

export function localizeNumber(num: number) {
  const userLocale = navigator.language || 'en-US';
  return new Intl.NumberFormat(userLocale, {
    maximumFractionDigits: 0
  }).format(num);
}
