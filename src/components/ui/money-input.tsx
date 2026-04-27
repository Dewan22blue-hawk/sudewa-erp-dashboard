import * as React from 'react';
import { Input } from '@/components/ui/input';
import { formatMoneyInput, parseMoneyInput } from '@/lib/utils/money-input';

type MoneyInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  value?: number | null;
  onChangeValue: (value: number) => void;
};

export function MoneyInput({ value, onChangeValue, onChange, ...rest }: MoneyInputProps) {
  const display = value === null || value === undefined ? '' : formatMoneyInput(value.toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMoneyInput(e.target.value);
    const numeric = parseMoneyInput(formatted);
    onChangeValue(numeric);
    onChange?.({ ...e, target: { ...e.target, value: formatted } } as React.ChangeEvent<HTMLInputElement>);
  };

  return <Input type="text" inputMode="numeric" value={display} onChange={handleChange} {...rest} />;
}
