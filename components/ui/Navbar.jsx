'use client';

import { FileText, Home, LogOut, Newspaper, PenLine } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Button } from './button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const { isAuthenticated, logoutHandler, user } = useAuth();
  const pathname = usePathname();

  const navItems = [
    ...(user.role === 'admin'
      ? [{ href: '/blog/all-blogs', label: 'All Blogs', icon: FileText }]
      : []),
    { href: '/blog/my-blogs', label: 'My Blogs', icon: Home },
    { href: '/blog/create-blog', label: 'Post Blog', icon: PenLine },
    { href: '/press-releases', label: 'Press Releases', icon: Newspaper },
    {
      href: '/press-releases/create-press-release',
      label: 'Post Release',
      icon: PenLine,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur">
      {isAuthenticated && (
        <nav className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-3 py-3">
          <Link
            href="/"
            className="rounded-md text-base font-bold text-slate-950"
          >
            Ladli Dashboard
          </Link>

          <ul className="flex flex-wrap items-center gap-2 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'inline-flex h-9 items-center gap-2 rounded-md px-3 text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-700',
                      isActive && 'bg-rose-100 text-rose-800'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <Button variant="destructive" onClick={logoutHandler}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
