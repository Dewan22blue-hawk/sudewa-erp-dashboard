"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({
    value,
    onChange,
    placeholder = "Select date",
    disabled,
    className,
    id
}: {
    value?: Date
    onChange?: (date?: Date) => void
    placeholder?: string
    disabled?: boolean
    className?: string
    id?: string
}) {
    const [open, setOpen] = React.useState(false)

    // Ensure value is a Date object if string is passed
    const dateValue = typeof value === 'string' ? new Date(value) : value;

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    id={id}
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateValue && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateValue ? format(dateValue, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                <Calendar
                    mode="single"
                    selected={dateValue}
                    onSelect={(date) => {
                        onChange?.(date)
                        setOpen(false)
                    }}
                    initialFocus
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                />
            </PopoverContent>
        </Popover>
    )
}
