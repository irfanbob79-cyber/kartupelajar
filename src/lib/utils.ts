import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTanggalIndonesia(dateString: string): string {
  if (!dateString) return "-";
  return dateString;
}

