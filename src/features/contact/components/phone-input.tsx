'use client';

import RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { Country } from 'react-phone-number-input';

type CountryOption = { divider?: boolean; label: string; value?: Country };

function CountrySelect({
  onChange,
  options,
  value,
}: {
  onChange: (value?: Country) => void;
  options: CountryOption[];
  value?: Country;
}) {
  const SelectedFlag = value ? flags[value] : undefined;

  return (
    <Select
      onValueChange={(next) => onChange(next === '__intl' ? undefined : (next as Country))}
      value={value ?? '__intl'}
    >
      <SelectTrigger
        aria-label="Country"
        className="h-full w-[74px] shrink-0 rounded-none border-0 border-r border-neutral-200 bg-neutral-50 px-2.5 shadow-none hover:bg-neutral-100 focus:ring-0 focus-visible:ring-0 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      >
        <SelectValue>
          {SelectedFlag ? (
            <span className="block h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.15)] [&>svg]:h-full [&>svg]:w-full">
              <SelectedFlag title={value ?? ''} />
            </span>
          ) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {options
          .filter((option): option is CountryOption & { value: Country } => Boolean(option.value))
          .map((option) => {
            const Flag = flags[option.value];
            return (
              <SelectItem key={option.value} value={option.value}>
                <span className="flex items-center gap-2">
                  {Flag ? (
                    <span className="block h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.15)] [&>svg]:h-full [&>svg]:w-full">
                      <Flag title={option.label} />
                    </span>
                  ) : (
                    <span className="w-5" />
                  )}
                  <span className="truncate">{option.label}</span>
                </span>
              </SelectItem>
            );
          })}
      </SelectContent>
    </Select>
  );
}

const COUNTRIES: Country[] = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'US',
];

const CONTAINER_CLASS =
  'flex w-full items-stretch border border-neutral-200 bg-white transition-colors focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-300 dark:border-neutral-800 dark:bg-neutral-950 ' +
  '[&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:px-3 [&_.PhoneInputInput]:py-2.5 [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:text-neutral-900 [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:placeholder:text-neutral-400 dark:[&_.PhoneInputInput]:text-neutral-50';

export function PhoneInput({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <RPNInput
      className={CONTAINER_CLASS}
      countries={COUNTRIES}
      countrySelectComponent={CountrySelect}
      defaultCountry="FR"
      international
      onChange={(next) => onChange(next ?? '')}
      placeholder="6 12 34 56 78"
      value={value}
    />
  );
}
