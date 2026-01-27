import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { DSpaceItem } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMetadataValue(item: DSpaceItem, fieldArg: string): string | undefined {
  if (!item || !item.metadata) return undefined
  // DSpaceItem metadata uses dotted keys directly, e.g. "dc.title"
  // Cast to any to access dynamic properties if needed, or stick to strict checking
  // Based on types.ts: metadata is Record<key, MetadataValue[]> where key is "dc.title" etc.

  // Try exact match first
  const fieldKey = fieldArg as keyof typeof item.metadata;
  const values = item.metadata[fieldKey];

  if (values && values.length > 0) {
    return values[0].value;
  }

  return undefined;
}

export function getMetadataValues(item: DSpaceItem, fieldArg: string): string[] {
  if (!item || !item.metadata) return []

  const fieldKey = fieldArg as keyof typeof item.metadata;
  const values = item.metadata[fieldKey];

  if (values && values.length > 0) {
    return values.map(v => v.value);
  }

  return []
}
