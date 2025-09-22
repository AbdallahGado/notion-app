import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<string | undefined | null | false>) {
  // Use clsx to join and twMerge to resolve tailwind class conflicts
  return twMerge(clsx(...(inputs as string[])));
}
