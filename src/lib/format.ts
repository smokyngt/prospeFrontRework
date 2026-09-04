import i18n from '@/lib/i18n';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
});

const relativeFormatters = new Map<string, Intl.RelativeTimeFormat>();
const currencyAliases: Record<string, string> = {
  $: 'USD',
  A$: 'AUD',
  C$: 'CAD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
};

function normalizeCurrencyCode(currency: string): string | null {
  const value = currency.trim();
  const alias = currencyAliases[value];

  if (alias) {
    return alias;
  }

  return /^[a-z]{3}$/i.test(value) ? value.toUpperCase() : null;
}

export const format = {
  bytes(bytes: number, decimals = 2): string {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  },
  compact(n: number): string {
    if (n >= 1e6) {
      return `${(n / 1e6).toFixed(1)}M`;
    }
    if (n >= 1e3) {
      return `${(n / 1e3).toFixed(1)}K`;
    }
    return n.toLocaleString();
  },
  currency(amount: number, currencyCode = 'USD'): string {
    if (!Number.isFinite(amount)) {
      return '-';
    }
    const lang = i18n.resolvedLanguage || i18n.language || 'en-US';
    const currency = normalizeCurrencyCode(currencyCode);

    if (currency) {
      return new Intl.NumberFormat(lang, {
        currency,
        style: 'currency',
      }).format(amount);
    }

    const number = new Intl.NumberFormat(lang, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount);
    return `${currencyCode.trim()}${currencyCode.trim() ? ' ' : ''}${number}`;
  },
  date(date: Date | number | string, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'number' ? new Date(date) : new Date(date);
    if (!options) {
      return dateFormatter.format(d);
    }
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    });
  },
  dateTime(date: Date | number | string, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'number' ? new Date(date) : new Date(date);
    if (!options) {
      return dateTimeFormatter.format(d);
    }
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    });
  },
  duration(ms: number): string {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${Math.round(ms)}ms`;
  },
  metricValue(name: string, v: number): string {
    const latencyKeys = new Set(['request.duration']);
    if (latencyKeys.has(name)) {
      return `${(v / 1000).toFixed(2)}s`;
    }
    return v.toLocaleString();
  },
  pct(a: number, b: number): number {
    return b === 0 ? 0 : (a / b) * 100;
  },
  relativeTime(value: Date | number | string): string {
    const d = typeof value === 'number' ? new Date(value) : new Date(value);
    const now = new Date();
    const locale = i18n.resolvedLanguage || i18n.language || undefined;
    const key = locale || 'default';
    if (!relativeFormatters.has(key)) {
      relativeFormatters.set(
        key,
        new Intl.RelativeTimeFormat(locale, {
          numeric: 'auto',
          style: 'long',
        }),
      );
    }
    const formatter = relativeFormatters.get(key)!;
    const sec = Math.round((d.getTime() - now.getTime()) / 1000);
    const absSec = Math.abs(sec);
    let formatted: string;
    if (absSec < 60) {
      formatted = formatter.format(sec, 'second');
    } else {
      const min = Math.round(sec / 60);
      if (Math.abs(min) < 60) {
        formatted = formatter.format(min, 'minute');
      } else {
        const hr = Math.round(sec / 3600);
        if (Math.abs(hr) < 24) {
          formatted = formatter.format(hr, 'hour');
        } else {
          const day = Math.round(sec / 86400);
          if (Math.abs(day) < 7) {
            formatted = formatter.format(day, 'day');
          } else {
            return this.date(d);
          }
        }
      }
    }
    const trimmed = formatted.trim();
    if (!trimmed.startsWith('-')) {
      return trimmed;
    }
    const amount = trimmed.slice(1).trim();
    const lang = i18n.resolvedLanguage || i18n.language || 'en';
    return lang.startsWith('fr') ? `il y a ${amount}` : `${amount} ago`;
  },
  time(date: Date | number | string, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'number' ? new Date(date) : new Date(date);
    if (!options) {
      return timeFormatter.format(d);
    }
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    });
  },
} as const;
