import React, { useState, useRef, useEffect } from 'react';
import { FormField } from './FormField';

interface MultipleDaysPickerProps {
  label: string;
  name: string;
  selectedDays: Date[];
  onDaysChange: (days: Date[]) => void;
  error?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function MultipleDaysPicker({
  label,
  name,
  selectedDays,
  onDaysChange,
  error,
  required = false,
  className = "",
  disabled = false
}: MultipleDaysPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    if (selectedDays.length === 0) return "Select days";
    if (selectedDays.length === 1) {
      return selectedDays[0].toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return `${selectedDays.length} days selected`;
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
    return selectedDays.some(day => day.toDateString() === date.toDateString());
  };

  const handleDayClick = (date: Date) => {
    const dateString = date.toDateString();
    const isAlreadySelected = selectedDays.some(day => day.toDateString() === dateString);
    
    if (isAlreadySelected) {
      // Remove the day
      const newDays = selectedDays.filter(day => day.toDateString() !== dateString);
      onDaysChange(newDays);
    } else {
      // Add the day
      const newDays = [...selectedDays, date].sort((a, b) => a.getTime() - b.getTime());
      onDaysChange(newDays);
    }
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
          <span className={selectedDays.length > 0 ? "text-foreground" : "text-muted-foreground"}>
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
                    onClick={() => day && handleDayClick(day)}
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

            {/* Selected Days Summary */}
            {selectedDays.length > 0 && (
              <div className="border-t border-border p-3">
                <div className="text-sm font-medium text-foreground mb-2">
                  Selected Days ({selectedDays.length}):
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedDays.map((day, index) => (
                    <div key={index}>
                      {day.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
