'use client';

import { MobileNav, DesktopNav } from '@/components/navigation/Navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-bg">
      <DesktopNav />
      <main className="md:ml-64 pb-20 md:pb-6">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
