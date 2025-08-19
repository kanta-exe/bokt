import { useState, useCallback, useMemo } from 'react';

export interface FieldError {
  field: string;
  message: string;
}

export interface FormErrors {
  [field: string]: string;
}

export class FormValidator {
  private errors: FormErrors = {};

  // Clear all errors
  clearErrors(): void {
    this.errors = {};
  }

  // Clear error for a specific field
  clearFieldError(field: string): void {
    delete this.errors[field];
  }

  // Set error for a specific field
  setFieldError(field: string, message: string): void {
    this.errors[field] = message;
  }

  // Get error for a specific field
  getFieldError(field: string): string | undefined {
    return this.errors[field];
  }

  // Get all errors
  getAllErrors(): FormErrors {
    return { ...this.errors };
  }

  // Check if form has any errors
  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  // Check if a specific field has an error
  hasFieldError(field: string): boolean {
    return !!this.errors[field];
  }

  // Validate required fields
  validateRequired(fields: { [field: string]: any }): boolean {
    let isValid = true;
    
    Object.entries(fields).forEach(([field, value]) => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        isValid = false;
      }
    });

    return isValid;
  }

  // Validate email format
  validateEmail(email: string, field: string = 'email'): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate minimum length
  validateMinLength(value: string, minLength: number, field: string): boolean {
    return value.length >= minLength;
  }

  // Validate maximum length
  validateMaxLength(value: string, maxLength: number, field: string): boolean {
    return value.length <= maxLength;
  }

  // Validate number range
  validateNumberRange(value: number, min: number, max: number, field: string): boolean {
    return value >= min && value <= max;
  }

  // Validate minimum value
  validateMinValue(value: number, min: number, field: string): boolean {
    return value >= min;
  }

  // Validate file size
  validateFileSize(file: File, maxSizeMB: number, field: string): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  // Validate file count
  validateFileCount(files: File[], minCount: number, maxCount: number, field: string): boolean {
    return files.length >= minCount && files.length <= maxCount;
  }

  // Validate phone number (basic validation)
  validatePhone(phone: string, field: string = 'phone'): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Validate Instagram handle
  validateInstagramHandle(handle: string, field: string = 'instagramHandle'): boolean {
    // Remove @ if present
    const cleanHandle = handle.replace('@', '');
    // Only lowercase letters, underscores, dots, and must have at least one character
    const handleRegex = /^[a-z._]+$/;
    return handleRegex.test(cleanHandle) && cleanHandle.length > 0;
  }

  // Validate password strength
  validatePassword(password: string, field: string = 'password'): boolean {
    return password.length >= 8 && 
           /(?=.*[a-z])/.test(password) && 
           /(?=.*[A-Z])/.test(password) && 
           /(?=.*\d)/.test(password);
  }

  // Format field name for error messages
  formatFieldName(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/([A-Z])/g, ' $1')
      .trim();
  }
}

// React hook for form validation
export function useFormValidation() {
  const [errors, setErrors] = useState<FormErrors>({});
  
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);
  
  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);
  
  const getFieldError = useCallback((field: string) => {
    return errors[field];
  }, [errors]);
  
  const hasFieldError = useCallback((field: string) => {
    return !!errors[field];
  }, [errors]);
  
  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);
  
  // Create a validator instance for validation methods
  const validator = useMemo(() => new FormValidator(), []);
  
  return {
    validator,
    errors,
    hasErrors: hasErrors(),
    clearErrors,
    clearFieldError,
    setFieldError,
    getFieldError,
    hasFieldError,
  };
}
