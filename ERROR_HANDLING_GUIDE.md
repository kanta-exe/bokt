# Field-Specific Error Handling System

This document describes the comprehensive field-specific error handling system implemented across the application.

## Overview

The new error handling system provides:
- **Field-specific error messages** that appear directly below each form field
- **Real-time error clearing** when users start typing
- **Visual error indicators** (red borders) on invalid fields
- **Accessible form fields** with proper ARIA attributes
- **Consistent styling** across all form components
- **Server error mapping** to specific fields when possible

## Components

### 1. Form Validation Utility (`lib/form-validation.ts`)

A comprehensive validation system with the following features:

```typescript
import { useFormValidation } from "@/lib/form-validation";

const { 
  validator, 
  errors, 
  hasErrors, 
  clearErrors, 
  clearFieldError, 
  setFieldError, 
  getFieldError, 
  hasFieldError 
} = useFormValidation();
```

#### Available Validation Methods:
- `validateRequired()` - Check required fields
- `validateEmail()` - Email format validation
- `validatePhone()` - Phone number validation
- `validatePassword()` - Password strength validation
- `validateMinLength()` / `validateMaxLength()` - String length validation
- `validateNumberRange()` / `validateMinValue()` - Number validation
- `validateFileSize()` / `validateFileCount()` - File validation
- `validateInstagramHandle()` - Instagram handle validation

### 2. Form Field Components (`components/FormField.tsx`)

Reusable form components that automatically handle error display:

#### InputField
```typescript
<InputField
  label="Full Name"
  name="name"
  value={form.name}
  onChange={(e) => updateForm({ name: e.target.value })}
  error={getFieldError('name')}
  required
  placeholder="Enter your name"
/>
```

#### SelectField
```typescript
<SelectField
  label="Category"
  name="category"
  value={form.category}
  onChange={(e) => updateForm({ category: e.target.value })}
  error={getFieldError('category')}
  required
>
  <option value="">Select a category</option>
  <option value="option1">Option 1</option>
</SelectField>
```

#### TextAreaField
```typescript
<TextAreaField
  label="Bio"
  name="bio"
  value={form.bio}
  onChange={(e) => updateForm({ bio: e.target.value })}
  error={getFieldError('bio')}
  rows={4}
  placeholder="Tell us about yourself..."
/>
```

#### FileField
```typescript
<FileField
  label="Photos"
  name="photos"
  onChange={(e) => handleFileUpload(e.target.files)}
  error={getFieldError('photos')}
  accept="image/*"
  multiple
  required
/>
```

## Implementation Examples

### Basic Form Implementation

```typescript
import { useState } from "react";
import { InputField, SelectField } from "@/components/FormField";
import { useFormValidation } from "@/lib/form-validation";

export default function MyForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
  });

  const { validator, clearErrors, setFieldError, getFieldError } = useFormValidation();

  const updateForm = (updates: Partial<typeof form>) => {
    setForm(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    Object.keys(updates).forEach(field => {
      validator.clearFieldError(field);
    });
  };

  const validateForm = () => {
    clearErrors();
    let isValid = true;

    if (!form.name.trim()) {
      setFieldError('name', 'Name is required');
      isValid = false;
    }

    if (!form.email.trim()) {
      setFieldError('email', 'Email is required');
      isValid = false;
    } else if (!validator.validateEmail(form.email)) {
      isValid = false;
    }

    if (!form.category) {
      setFieldError('category', 'Please select a category');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Submit form
      console.log('Form is valid:', form);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Full Name"
        name="name"
        value={form.name}
        onChange={(e) => updateForm({ name: e.target.value })}
        error={getFieldError('name')}
        required
      />

      <InputField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={(e) => updateForm({ email: e.target.value })}
        error={getFieldError('email')}
        required
      />

      <SelectField
        label="Category"
        name="category"
        value={form.category}
        onChange={(e) => updateForm({ category: e.target.value })}
        error={getFieldError('category')}
        required
      >
        <option value="">Select a category</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </SelectField>

      {getFieldError('general') && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{getFieldError('general')}</p>
        </div>
      )}

      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        Submit
      </button>
    </form>
  );
}
```

### Server Error Handling

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  clearErrors();
  
  if (!validateForm()) {
    return;
  }

  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      // Success
      router.push('/success');
    } else {
      const errorData = await response.json();
      const errorMessage = errorData.error || 'An error occurred';
      
      // Map server errors to specific fields
      if (errorMessage.toLowerCase().includes('email')) {
        setFieldError('email', errorMessage);
      } else if (errorMessage.toLowerCase().includes('name')) {
        setFieldError('name', errorMessage);
      } else {
        setFieldError('general', errorMessage);
      }
    }
  } catch (error) {
    setFieldError('general', 'Network error. Please try again.');
  }
};
```

## Updated Forms

The following forms have been updated to use the new error handling system:

### 1. Sign Up Form (`pages/auth/signup.tsx`)
- Field-specific validation for name, email, and password
- Password strength validation
- Server error mapping

### 2. Sign In Form (`pages/auth/signin.tsx`)
- Email and password validation
- Server error mapping for authentication failures

### 3. Model Application Form (`pages/auth/model-application.tsx`)
- Multi-step form with step-specific validation
- Comprehensive field validation for all model details
- File upload validation
- Server error mapping

### 4. Booking Form (`pages/talent/[id].tsx`)
- Contact information validation
- Date and budget validation
- Server error mapping

## Testing

Visit `/test-form` to see a demonstration of the error handling system in action. The test form includes:

- All form field types (input, select, textarea)
- Comprehensive validation examples
- Real-time error clearing
- Visual error indicators
- General error display

## Best Practices

1. **Always clear errors when updating fields**:
   ```typescript
   const updateForm = (updates: Partial<FormData>) => {
     setForm(prev => ({ ...prev, ...updates }));
     Object.keys(updates).forEach(field => {
       validator.clearFieldError(field);
     });
   };
   ```

2. **Use specific field names for errors**:
   ```typescript
   setFieldError('email', 'Please enter a valid email address');
   setFieldError('password', 'Password must be at least 8 characters');
   ```

3. **Map server errors to specific fields when possible**:
   ```typescript
   if (errorMessage.toLowerCase().includes('email')) {
     setFieldError('email', errorMessage);
   } else {
     setFieldError('general', errorMessage);
   }
   ```

4. **Provide clear, actionable error messages**:
   ```typescript
   // Good
   setFieldError('password', 'Password must contain at least one uppercase letter');
   
   // Bad
   setFieldError('password', 'Invalid password');
   ```

5. **Use the general error field for non-field-specific errors**:
   ```typescript
   setFieldError('general', 'Network error. Please try again.');
   ```

## Accessibility Features

All form components include:
- Proper `aria-describedby` attributes linking to error messages
- `aria-invalid` attributes on fields with errors
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly error announcements

## Styling

The error handling system uses consistent styling:
- Red borders on invalid fields
- Red text for error messages
- Proper focus states
- Responsive design
- Dark mode support

Error messages appear below each field with clear visual indicators, making it easy for users to identify and fix issues.
