import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export function formatPercentage(value: number, total: number): string {
  return `${Math.min(100, (value / total) * 100).toFixed(1)}%`;
}

export function calculateMonthlyIncome(weeklyHours: number, hourlyWage: number, frequency: 'weekly' | 'monthly'): number {
  if (frequency === 'weekly') {
    return weeklyHours * hourlyWage * 4.33; // 月平均4.33週
  } else {
    return weeklyHours * hourlyWage * 4.33;
  }
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}
