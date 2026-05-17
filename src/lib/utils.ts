import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoneyInput(value: string) {
  let val = value.replace(/[^\d.-]/g, '');
  const isNegative = val.startsWith('-');
  val = val.replace(/-/g, '');
  const parts = val.split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (isNegative ? '-' : '') + integerPart + decimalPart;
}
