import React from 'react';

function SkeletonBlock({ className }) {
  return <div className={`${className} animate-pulse bg-slate-200/80`} />;
}

function getPathname() {
  try {
    return typeof window !== 'undefined' ? window.location.pathname || '/' : '/';
  } catch {
    return '/';
  }
}

export function LoadingSkeleton() {
  const path = getPathname();
  const isAdmin = path.startsWith('/admin');
  const isShop = path === '/shop' || path.startsWith('/shop/');
  const isHome = path === '/' || path === '';

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="grid min-h-screen grid-cols-1 gap-0 lg:grid-cols-[280px_1fr]">
          <aside className="sticky top-0 h-screen border-r border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 px-6 py-6">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-8 w-8 rounded-full bg-white/60" />
                <SkeletonBlock className="h-4 w-28 rounded bg-white/60" />
              </div>
            </div>
            <div className="px-6 py-5 border-b border-slate-200">
              <SkeletonBlock className="h-4 w-40 rounded" />
              <SkeletonBlock className="mt-2 h-3 w-24 rounded" />
            </div>
            <div className="px-4 py-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-10 w-full rounded-full" />
              ))}
            </div>
          </aside>

          <main className="min-h-screen bg-slate-100 w-full p-6 sm:p-10">
            <div className="rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-8 shadow">
              <SkeletonBlock className="h-8 w-56 rounded bg-white/70" />
              <SkeletonBlock className="mt-3 h-4 w-72 rounded bg-white/60" />
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white p-6 shadow">
                  <SkeletonBlock className="h-3 w-24 rounded" />
                  <SkeletonBlock className="mt-4 h-8 w-28 rounded" />
                  <SkeletonBlock className="mt-2 h-3 w-32 rounded" />
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white p-6 shadow">
                  <SkeletonBlock className="h-4 w-32 rounded" />
                  <SkeletonBlock className="mt-2 h-3 w-44 rounded" />
                  <div className="mt-6 h-56 rounded-xl bg-slate-100 overflow-hidden">
                    <SkeletonBlock className="h-full w-full rounded-xl bg-slate-200/60" />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isShop) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SkeletonBlock className="h-8 w-56 rounded" />
              <SkeletonBlock className="mt-2 h-4 w-72 rounded" />
            </div>
            <SkeletonBlock className="h-10 w-full sm:w-80 rounded-full" />
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <SkeletonBlock className="h-44 w-full rounded-none" />
                <div className="p-5">
                  <SkeletonBlock className="h-4 w-40 rounded" />
                  <SkeletonBlock className="mt-3 h-3 w-full rounded" />
                  <SkeletonBlock className="mt-2 h-3 w-5/6 rounded" />
                  <div className="mt-4 flex items-center justify-between">
                    <SkeletonBlock className="h-6 w-20 rounded" />
                    <SkeletonBlock className="h-9 w-28 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isHome) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-amber-200 via-yellow-100 to-rose-200">
        <div className="mx-auto max-w-7xl px-8 py-20 md:px-16">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="flex flex-col justify-center gap-6">
              <SkeletonBlock className="h-9 w-64 rounded-full bg-white/70" />
              <SkeletonBlock className="h-14 w-96 rounded" />
              <SkeletonBlock className="h-5 w-80 rounded" />
              <SkeletonBlock className="h-5 w-[26rem] rounded" />
              <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                <SkeletonBlock className="h-12 w-40 rounded-full bg-amber-300/80" />
                <SkeletonBlock className="h-12 w-56 rounded-full bg-white/70" />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-rose-50/90 shadow-2xl ring-1 ring-white/40">
                <SkeletonBlock className="h-[320px] w-full rounded-none bg-slate-200/60" />
                <div className="p-8 pb-10">
                  <SkeletonBlock className="h-6 w-52 rounded" />
                  <SkeletonBlock className="mt-3 h-4 w-full rounded" />
                  <SkeletonBlock className="mt-2 h-4 w-5/6 rounded" />
                  <div className="mt-6 flex gap-3">
                    <SkeletonBlock className="h-7 w-24 rounded-full bg-amber-200/80" />
                    <SkeletonBlock className="h-7 w-24 rounded-full bg-white/70" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-6xl px-0 md:px-0">
            <div className="relative -mt-12 rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur">
              <div className="text-center mb-8">
                <SkeletonBlock className="mx-auto h-7 w-40 rounded" />
                <SkeletonBlock className="mx-auto mt-3 h-4 w-64 rounded" />
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                    <SkeletonBlock className="h-44 w-full rounded-none" />
                    <div className="p-5">
                      <SkeletonBlock className="h-4 w-44 rounded" />
                      <SkeletonBlock className="mt-3 h-3 w-full rounded" />
                      <div className="mt-4 flex items-center justify-between">
                        <SkeletonBlock className="h-6 w-20 rounded" />
                        <SkeletonBlock className="h-9 w-28 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl p-6 sm:p-10">
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="flex items-center justify-between gap-4">
            <SkeletonBlock className="h-8 w-48 rounded-lg" />
            <SkeletonBlock className="h-10 w-28 rounded-full" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
                <SkeletonBlock className="h-4 w-28 rounded" />
                <SkeletonBlock className="mt-4 h-8 w-20 rounded" />
                <SkeletonBlock className="mt-3 h-3 w-full rounded bg-slate-200/60" />
                <SkeletonBlock className="mt-2 h-3 w-5/6 rounded bg-slate-200/60" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

