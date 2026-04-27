import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

export interface SearchableSelectOption {
  value: string;
  label: string;
  subtitle?: string;
}

interface SearchableSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  loading?: boolean;
  onSearchChange?: (value: string) => void;
  className?: string;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = 'Cari data...',
  emptyText = 'Data tidak ditemukan.',
  disabled,
  loading,
  onSearchChange,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between font-normal', !selectedOption && 'text-muted-foreground', className)}
        >
          <span className="truncate text-left">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} onValueChange={onSearchChange} />
          <CommandList>
            <CommandEmpty>{loading ? 'Memuat...' : emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.subtitle ?? ''}`}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="flex items-start gap-2"
                >
                  <Check className={cn('mt-0.5 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
                  <div className="min-w-0">
                    <div className="truncate">{option.label}</div>
                    {option.subtitle ? <div className="text-xs text-muted-foreground">{option.subtitle}</div> : null}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
