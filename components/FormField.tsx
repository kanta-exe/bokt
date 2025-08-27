import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ 
  label, 
  name, 
  error, 
  required = false, 
  children, 
  className = "" 
}: FormFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600 mt-1" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick?: () => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onClick,
  error,
  required = false,
  placeholder,
  className = "",
  disabled = false,
  min,
  max,
  step
}: InputFieldProps) {
  const baseInputClasses = "mt-1 block w-full rounded-md border bg-muted text-foreground shadow-sm focus:border-accent focus:ring-accent focus:bg-background placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed";
  const clickableClasses = onClick ? "cursor-pointer" : "";
  const errorClasses = error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-border";
  
  return (
    <FormField label={label} name={name} error={error} required={required} className={className}>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onClick={onClick}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`${baseInputClasses} ${errorClasses} ${clickableClasses}`}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-invalid={error ? "true" : "false"}
      />
    </FormField>
  );
}

interface TextAreaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  rows?: number;
}

export function TextAreaField({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  className = "",
  disabled = false,
  rows = 3
}: TextAreaFieldProps) {
  const baseTextAreaClasses = "mt-1 block w-full rounded-md border bg-muted text-foreground shadow-sm focus:border-accent focus:ring-accent focus:bg-background placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed";
  const errorClasses = error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-border";
  
  return (
    <FormField label={label} name={name} error={error} required={required} className={className}>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`${baseTextAreaClasses} ${errorClasses}`}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-invalid={error ? "true" : "false"}
      />
    </FormField>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  className = "",
  disabled = false,
  children
}: SelectFieldProps) {
  const baseSelectClasses = "mt-1 block w-full rounded-md border bg-muted text-foreground shadow-sm focus:border-accent focus:ring-accent focus:bg-background disabled:opacity-50 disabled:cursor-not-allowed";
  const errorClasses = error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-border";
  
  return (
    <FormField label={label} name={name} error={error} required={required} className={className}>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`${baseSelectClasses} ${errorClasses}`}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-invalid={error ? "true" : "false"}
      >
        {children}
      </select>
    </FormField>
  );
}

interface FileFieldProps {
  label: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
}

export function FileField({
  label,
  name,
  onChange,
  error,
  required = false,
  className = "",
  disabled = false,
  accept,
  multiple = false
}: FileFieldProps) {
  const baseFileClasses = "mt-1 block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-accent file:text-black hover:file:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed";
  const errorClasses = error ? "border-red-500" : "border-border";
  
  return (
    <FormField label={label} name={name} error={error} required={required} className={className}>
      <input
        id={name}
        name={name}
        type="file"
        onChange={onChange}
        required={required}
        disabled={disabled}
        accept={accept}
        multiple={multiple}
        className={`${baseFileClasses} ${errorClasses}`}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-invalid={error ? "true" : "false"}
      />
    </FormField>
  );
}
