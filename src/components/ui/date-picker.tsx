'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  disabled,
  className,
  id,
  fromYear = 1900,
  toYear = new Date().getFullYear() + 10,
}: {
  value?: Date | string | null;
  onChange?: (date?: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  fromYear?: number;
  toYear?: number;
}) {
  const [open, setOpen] = React.useState(false);

  // Ensure value is a valid Date object if string/null is passed
  let dateValue = typeof value === 'string' ? new Date(value) : (value as Date | undefined | null);

  // Fallback if date is invalid to prevent "Invalid time value" crashes
  if (dateValue && (isNaN(dateValue.getTime()) || !(dateValue instanceof Date))) {
    dateValue = undefined;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" id={id} variant={'outline'} className={cn('w-full justify-start text-left font-normal', !dateValue && 'text-muted-foreground', className)} disabled={disabled}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-lg rounded-md" align="start" sideOffset={8}>
        <Calendar
          mode="single"
          selected={dateValue || undefined}
          onSelect={(date) => {
            onChange?.(date);
            setOpen(false);
          }}
          initialFocus
          captionLayout="dropdown-buttons"
          fromYear={1950}
          toYear={new Date().getFullYear() + 10}
        />
      </PopoverContent>
    </Popover>
  );
}
