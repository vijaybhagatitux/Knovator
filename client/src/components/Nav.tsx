// src/components/Nav.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Nav() {
  const router = useRouter();
  const q = router.query;

  // Helper to keep existing query params (if you want) — currently we link to clean routes with defaults
  return (
    <nav className="w-full border-b bg-white/60 dark:bg-black/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold">
            Job Importer
          </Link>
          <span className="text-sm text-gray-500">/ admin</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={{
              pathname: '/jobs',
              query: { page: 1, limit: 10 },
            }}
            className="rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5"
          >
            Jobs
          </Link>

          <Link
            href={{
              pathname: '/imports',
              query: { page: 1, limit: 10 },
            }}
            className="rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5"
          >
            Import Logs
          </Link>

          <Link
            href="/"
            className="rounded-md border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:text-gray-300"
          >
            Home
          </Link>
        </div>
      </div>
    </nav>
  );
}
