import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatUZS(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
}

export function formatShortUZS(amount) {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1).replace('.0', '') + " mln";
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + " ming";
  }
  return amount.toString();
}

export function formatUzbekPhone(value) {
  if (!value) return '+998 ';
  
  // Extract digits only - instantly strips all letters and symbols
  let digits = value.toString().replace(/\D/g, '');
  
  if (digits === '' || digits === '9' || digits === '99') {
    return '+998 ';
  }
  
  if (digits.startsWith('998')) {
    digits = digits.slice(3);
  }
  
  // Max 9 national digits (e.g. 90 123 45 67)
  digits = digits.slice(0, 9);
  
  let res = '+998';
  if (digits.length > 0) {
    res += ' ' + digits.slice(0, 2);
  }
  if (digits.length > 2) {
    res += ' ' + digits.slice(2, 5);
  }
  if (digits.length > 5) {
    res += ' ' + digits.slice(5, 7);
  }
  if (digits.length > 7) {
    res += ' ' + digits.slice(7, 9);
  }
  return res;
}
