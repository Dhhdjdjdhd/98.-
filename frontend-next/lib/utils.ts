import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const won = (n: number) => n.toLocaleString('ko-KR') + '원';
export const pad2 = (n: number) => String(n).padStart(2, '0');
