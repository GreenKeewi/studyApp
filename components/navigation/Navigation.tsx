'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, GraduationCap, Mic, Settings } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Homework', href: '/homework', icon: BookOpen },
  { name: 'Study', href: '/study', icon: GraduationCap },
  { name: 'Lectures', href: '/lectures', icon: Mic },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-dark-border md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-brand-primary'
                  : 'text-dark-text-secondary hover:text-dark-text-primary'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-col w-64 bg-dark-surface border-r border-dark-border h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-brand-primary">StudyApe</h1>
        <p className="text-sm text-dark-text-secondary mt-1">AI Study Platform</p>
      </div>

      <div className="flex-1 px-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-dark-border">
        <p className="text-xs text-dark-text-tertiary text-center">
          © 2024 StudyApe
        </p>
      </div>
    </nav>
  );
}
