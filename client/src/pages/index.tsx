// src/pages/index.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import Nav from '../components/Nav';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function Home() {
  const router = useRouter();

  // Optional: auto-redirect straight to jobs page
  // Uncomment if you want the root URL to immediately redirect to /jobs
  /*
  useEffect(() => {
    router.replace({ pathname: '/jobs', query: { page: 1, limit: 10 } });
  }, [router]);
  */

  return (
<div className={`${geistSans.className} ${geistMono.className} min-h-screen bg-white text-black`}>
  <Nav />

  <main className="mx-auto max-w-5xl px-8 py-24 flex flex-col items-center">
    <header className="mb-16 text-center flex flex-col items-center gap-6">
      <div className="flex items-center justify-center gap-4">
        <Image src="/next.svg" alt="Next.js logo" width={56} height={16} />
        <h1 className="text-4xl font-bold text-black">
          Job Importer — Dashboard
        </h1>
      </div>
      <p className="max-w-2xl text-lg text-gray-800 leading-relaxed">
        View imported job listings and import run logs. Use the links below to open the Jobs list
        or Import Logs with built-in pagination.
      </p>
    </header>

    <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
      <Link
        href={{ pathname: '/jobs', query: { page: 1, limit: 10 } }}
        className="group block rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg transition-all duration-300"
      >
        <h2 className="text-xl font-semibold text-black group-hover:text-blue-600">
          Jobs
        </h2>
        <p className="mt-3 text-sm text-gray-700">
          Browse job listings imported from feeds. Click to open the paginated job list.
        </p>
        <div className="mt-5 text-sm text-gray-500">Preview URL: /jobs?page=1&amp;limit=10</div>
      </Link>

      <Link
        href={{ pathname: '/imports', query: { page: 1, limit: 10 } }}
        className="group block rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg transition-all duration-300"
      >
        <h2 className="text-xl font-semibold text-black group-hover:text-blue-600">
          Import Logs
        </h2>
        <p className="mt-3 text-sm text-gray-700">
          View recent import runs, success/failure counts, and runtime info.
        </p>
        <div className="mt-5 text-sm text-gray-500">Preview URL: /imports?page=1&amp;limit=10</div>
      </Link>
    </section>
  </main>
</div>

  );
}
