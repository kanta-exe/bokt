import React, { useState, useRef, useEffect } from 'react';
import { FormField } from './FormField';

interface DateTimePickerProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  className = "",
  disabled = false
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(value ? new Date(value) : new Date());
  const [selectedTime, setSelectedTime] = useState<string>(value ? value.slice(11, 16) : "12:00");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setSelectedTime(date.toTimeString().slice(0, 5));
    }
  }, [value]);

  const handleDateSelect = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(parseInt(selectedTime.split(':')[0]));
    newDate.setMinutes(parseInt(selectedTime.split(':')[1]));
    setSelectedDate(newDate);
    onChange(newDate.toISOString().slice(0, 16));
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(time.split(':')[0]));
      newDate.setMinutes(parseInt(time.split(':')[1]));
      onChange(newDate.toISOString().slice(0, 16));
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatDisplayValue = () => {
    if (!value) return "Select date & time";
    const date = new Date(value);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <FormField label={label} name={name} error={error} required={required} className={className}>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`mt-1 block w-full rounded-md border bg-muted text-foreground shadow-sm focus:border-accent focus:ring-accent focus:bg-background disabled:opacity-50 disabled:cursor-not-allowed text-left px-3 py-2 ${
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-border"
          } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
          disabled={disabled}
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {formatDisplayValue()}
          </span>
          <svg
            className={`ml-2 h-4 w-4 float-right transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-80 rounded-md border border-border bg-background shadow-lg">
            {/* Calendar Header */}
            <div className="flex items-center justify-between border-b border-border p-3">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="rounded p-1 hover:bg-muted"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-medium">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button
                type="button"
                onClick={goToNextMonth}
                className="rounded p-1 hover:bg-muted"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-3">
              <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center font-medium">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => day && handleDateSelect(day)}
                    className={`h-8 w-8 rounded text-sm transition-colors ${
                      !day
                        ? "invisible"
                        : isToday(day)
                        ? "bg-accent text-black font-medium"
                        : isSelected(day)
                        ? "bg-accent/20 text-accent-foreground font-medium"
                        : "hover:bg-muted"
                    }`}
                    disabled={!day}
                  >
                    {day?.getDate()}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Picker */}
            <div className="border-t border-border p-3">
              <label className="block text-sm font-medium text-foreground mb-2">Time</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full rounded border border-border bg-muted px-3 py-2 text-foreground focus:border-accent focus:ring-accent focus:bg-background [&::-webkit-calendar-picker-indicator]:bg-accent [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:hover:bg-accent/90"
              />
            </div>

            {/* Close Button */}
            <div className="border-t border-border p-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full rounded bg-accent px-3 py-2 text-sm font-medium text-black hover:bg-accent/90"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </FormField>
  );
}

