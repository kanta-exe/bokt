import { useTheme } from '@/lib/theme-context'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="inline-flex items-center justify-center rounded-full p-3 text-sm font-medium transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-lg bg-background border border-border hover:scale-105"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        // Sun icon for light mode
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="m12 2 0 2" />
          <path d="m12 20 0 2" />
          <path d="m2 12 2 0" />
          <path d="m20 12 2 0" />
          <path d="m6.34 6.34-1.42-1.42" />
          <path d="m17.66 6.34 1.42-1.42" />
          <path d="m6.34 17.66-1.42 1.42" />
          <path d="m17.66 17.66 1.42 1.42" />
        </svg>
      ) : (
        // Moon icon for dark mode
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          <path d="m5 3 1.5 1.5" />
          <path d="m19 3-1.5 1.5" />
          <path d="m5 21 1.5-1.5" />
          <path d="m19 21-1.5-1.5" />
        </svg>
      )}
    </button>
  )
}
