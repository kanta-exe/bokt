import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { InputField } from "@/components/FormField";
import { useFormValidation } from "@/lib/form-validation";

export default function SignIn({ csrfToken }: { csrfToken: string }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { validator, clearErrors, setFieldError, getFieldError } = useFormValidation();

  // If already authenticated, redirect immediately
  if (status === "authenticated" && session?.user) {
    const userRole = (session.user as any)?.role;
    console.log('🔄 User already authenticated with role:', userRole);
    
    // Use setTimeout to avoid immediate redirect during render
    setTimeout(() => {
      if (userRole === "ADMIN") {
        console.log('🚀 Redirecting admin to /admin');
        window.location.href = "/admin";
      } else if (userRole === "BRAND") {
        window.location.href = "/brand/dashboard";
      } else if (userRole === "MODEL") {
        window.location.href = "/model/dashboard";
      } else {
        window.location.href = "/";
      }
    }, 100);
    
    return (
      <div className="container-page py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="mb-6 text-3xl font-bold">Already signed in</h1>
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    clearErrors();
    let isValid = true;

    if (!email.trim()) {
      setFieldError('email', 'Email is required');
      isValid = false;
    } else if (!validator.validateEmail(email)) {
      isValid = false;
    }

    if (!password.trim()) {
      setFieldError('password', 'Password is required');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearErrors();
    
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('🔐 Attempting sign in for:', email);
      const res = await signIn("credentials", { email, password, redirect: false });
      
      if (res?.error) {
        console.log('❌ Sign in error:', res.error);
        // Try to map the error to specific fields
        if (res.error.toLowerCase().includes('email') || res.error.toLowerCase().includes('user')) {
          setFieldError('email', 'Invalid email address');
        } else if (res.error.toLowerCase().includes('password')) {
          setFieldError('password', 'Invalid password');
        } else {
          setFieldError('general', 'Invalid email or password');
        }
      } else {
        console.log('✅ Sign in successful, redirecting...');
        // Force a page reload to trigger the authenticated state
        window.location.reload();
      }
    } catch (err) {
      console.error('💥 Sign in exception:', err);
      setFieldError('general', 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="container-page py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="mb-6 text-3xl font-bold">Loading...</h1>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="mb-6 text-3xl font-bold">Sign in</h1>
      <form
        className="max-w-md space-y-4"
        onSubmit={handleSubmit}
      >
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        
        <InputField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validator.clearFieldError('email');
          }}
          error={getFieldError('email')}
          required
        />
        
        <InputField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            validator.clearFieldError('password');
          }}
          error={getFieldError('password')}
          required
        />
        
        {getFieldError('general') && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {getFieldError('general')}
          </p>
        )}
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="rounded-md bg-accent px-4 py-2 font-semibold text-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm">
        Don&apos;t have an account? <Link href="/auth/signup" className="text-accent underline">Create one</Link>
      </p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const csrfToken = await getCsrfToken(context);
  return { props: { csrfToken } };
};


