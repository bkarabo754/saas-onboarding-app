import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f4ff] via-white to-[#f5e8ff] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm">
            Sign in to continue your journey with{' '}
            <span className="font-semibold">OnboardingIQ</span>
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900/80 shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800 p-6">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary:
                  'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-md shadow-sm',
                card: 'shadow-none bg-transparent',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
