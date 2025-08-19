import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { InputField, SelectField } from "@/components/FormField";
import { useFormValidation } from "@/lib/form-validation";

export default function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "BRAND" });
  const [loading, setLoading] = useState(false);
  const { validator, errors, clearErrors, setFieldError, getFieldError } = useFormValidation();

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

    // Validate required fields
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

    if (!form.password.trim()) {
      setFieldError('password', 'Password is required');
      isValid = false;
    } else if (!validator.validatePassword(form.password)) {
      isValid = false;
    }

    return isValid;
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    clearErrors();
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    
    // Redirect models to application form
    if (form.role === "MODEL") {
      router.push("/auth/model-application");
      return;
    }
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        router.push("/auth/signin");
      } else {
        const errorData = await res.json();
        const errorMessage = errorData.error ?? "Unable to register";
        
        // Try to map server errors to specific fields
        if (errorMessage.toLowerCase().includes('email')) {
          setFieldError('email', errorMessage);
        } else if (errorMessage.toLowerCase().includes('password')) {
          setFieldError('password', errorMessage);
        } else if (errorMessage.toLowerCase().includes('name')) {
          setFieldError('name', errorMessage);
        } else {
          // Set a general error if we can't map it to a specific field
          setFieldError('general', errorMessage);
        }
      }
    } catch (error) {
      setFieldError('general', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-12">
      <h1 className="mb-6 text-3xl font-bold">Create account</h1>
      <form className="max-w-lg space-y-4" onSubmit={submit}>
        <InputField
          label="Name"
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
        
        <InputField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={(e) => updateForm({ password: e.target.value })}
          error={getFieldError('password')}
          required
        />
        
        <SelectField
          label="I am a"
          name="role"
          value={form.role}
          onChange={(e) => updateForm({ role: e.target.value })}
        >
          <option value="BRAND">Brand</option>
          <option value="MODEL">Model</option>
        </SelectField>
        
        {form.role === "MODEL" && (
          <p className="mt-2 text-sm text-gray-600">
            Models will be redirected to complete a detailed application form that requires approval.
          </p>
        )}
        
        {getFieldError('general') && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {getFieldError('general')}
          </p>
        )}
        
        <button 
          type="submit" 
          disabled={loading}
          className="rounded-md bg-accent px-4 py-2 font-semibold text-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}



