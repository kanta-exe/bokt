import Link from "next/link";

export default function ApplicationSuccess() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
            <svg
              className="h-6 w-6 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Application Submitted!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you for your interest in joining BOKT. We&apos;ve received your application and will review it carefully.
          </p>
        </div>
        
        <div className="bg-muted border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium text-foreground mb-3">What happens next?</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start">
              <span className="text-accent mr-2">•</span>
              Our team will review your application within 2-3 business days
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2">•</span>
              Your profile will then be visible to brands on the platform
            </li>
          </ul>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Please check your email for updates. We look forward to potentially working with you!
          </p>
        </div>
      </div>
    </div>
  );
}
