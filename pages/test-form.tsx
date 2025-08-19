import { useState } from "react";
import { InputField, SelectField, TextAreaField } from "@/components/FormField";
import { useFormValidation } from "@/lib/form-validation";

export default function TestForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    category: "",
    bio: "",
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

    // Validate name
    if (!form.name.trim()) {
      setFieldError('name', 'Name is required');
      isValid = false;
    } else if (form.name.length < 2) {
      setFieldError('name', 'Name must be at least 2 characters');
      isValid = false;
    }

    // Validate email
    if (!form.email.trim()) {
      setFieldError('email', 'Email is required');
      isValid = false;
    } else if (!validator.validateEmail(form.email)) {
      isValid = false;
    }

    // Validate phone
    if (!form.phone.trim()) {
      setFieldError('phone', 'Phone number is required');
      isValid = false;
    } else if (!validator.validatePhone(form.phone)) {
      isValid = false;
    }

    // Validate age
    if (!form.age.trim()) {
      setFieldError('age', 'Age is required');
      isValid = false;
    } else {
      const ageNum = parseInt(form.age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
        setFieldError('age', 'Age must be between 18 and 100');
        isValid = false;
      }
    }

    // Validate category
    if (!form.category) {
      setFieldError('category', 'Please select a category');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      alert('Form is valid! Check console for form data.');
      console.log('Form data:', form);
    } else {
      alert('Please fix the errors below.');
    }
  };

  return (
    <div className="container-page py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Field-Specific Error Handling Demo</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={(e) => updateForm({ name: e.target.value })}
            error={getFieldError('name')}
            required
            placeholder="Enter your full name"
          />

          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => updateForm({ email: e.target.value })}
            error={getFieldError('email')}
            required
            placeholder="Enter your email"
          />

          <InputField
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={(e) => updateForm({ phone: e.target.value })}
            error={getFieldError('phone')}
            required
            placeholder="Enter your phone number"
          />

          <InputField
            label="Age"
            name="age"
            type="number"
            value={form.age}
            onChange={(e) => updateForm({ age: e.target.value })}
            error={getFieldError('age')}
            required
            min={18}
            max={100}
            placeholder="Enter your age"
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
            <option value="student">Student</option>
            <option value="professional">Professional</option>
            <option value="retired">Retired</option>
            <option value="other">Other</option>
          </SelectField>

          <TextAreaField
            label="Bio (Optional)"
            name="bio"
            value={form.bio}
            onChange={(e) => updateForm({ bio: e.target.value })}
            placeholder="Tell us about yourself..."
            rows={4}
          />

          {getFieldError('general') && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{getFieldError('general')}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Submit Form
            </button>
            
            <button
              type="button"
              onClick={() => {
                clearErrors();
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  age: "",
                  category: "",
                  bio: "",
                });
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Form
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Features Demonstrated:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Field-specific error messages that appear below each field</li>
            <li>Real-time error clearing when user starts typing</li>
            <li>Visual error indicators (red borders) on invalid fields</li>
            <li>Comprehensive validation (required fields, email format, phone format, age range)</li>
            <li>General error display for non-field-specific errors</li>
            <li>Accessible form fields with proper ARIA attributes</li>
            <li>Consistent styling across all form components</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
