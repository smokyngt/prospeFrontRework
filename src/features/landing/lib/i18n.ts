import type { TFunction } from 'i18next';

export function stringListAt(t: TFunction, path: string): string[] {
  const value = t(path, { returnObjects: true });
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

export function arrayAt<T>(t: TFunction, path: string): T[] {
  const value = t(path, { returnObjects: true });
  return Array.isArray(value) ? (value as T[]) : [];
}

export function recordMap<T extends Record<string, unknown>>(
  t: TFunction,
  path: string,
): Partial<T> {
  const value = t(path, { returnObjects: true });
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Partial<T>) : {};
}
