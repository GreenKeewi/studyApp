'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, userSettings, loading, signInAnon } = useAuth();

  useEffect(() => {
    const initialize = async () => {
      if (loading) return;

      // Sign in anonymously if no user
      if (!user) {
        await signInAnon();
        return;
      }

      // Redirect based on onboarding status
      if (userSettings) {
        if (userSettings.onboardingCompleted) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
    };

    initialize();
  }, [user, userSettings, loading, router, signInAnon]);

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        <p className="mt-4 text-dark-text-secondary">Loading StudyApe...</p>
      </div>
    </div>
  );
}
