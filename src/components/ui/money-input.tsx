import * as React from 'react';
import { Input } from '@/components/ui/input';
import { formatMoneyInput, parseMoneyInput } from '@/lib/utils/money-input';

type MoneyInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> & {
  value?: number | null;
  onChangeValue: (value: number) => void;
  currency?: 'IDR' | 'USD';
};

export function MoneyInput({ value, onChangeValue, onChange, currency = 'IDR', ...rest }: MoneyInputProps) {
  const display = value === null || value === undefined ? '' : formatMoneyInput(value.toString(), currency);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMoneyInput(e.target.value, currency);
    const numeric = parseMoneyInput(formatted, currency);
    onChangeValue(numeric);
    onChange?.({ ...e, target: { ...e.target, value: formatted } } as React.ChangeEvent<HTMLInputElement>);
  };

  return <Input type="text" inputMode={currency === 'USD' ? 'decimal' : 'numeric'} value={display} onChange={handleChange} {...rest} />;
}
