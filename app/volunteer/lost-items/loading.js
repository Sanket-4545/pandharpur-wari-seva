import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function LostItemsLoading() {
  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <section className="relative min-h-[30vh] md:min-h-[35vh] flex flex-col justify-center py-16 overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600">
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-xs font-semibold mb-6">
            <div className="h-3 w-16 bg-white/20 rounded animate-pulse" />
            <span className="text-white/40">/</span>
            <div className="h-3 w-24 bg-white/20 rounded animate-pulse" />
          </div>
          <div className="h-10 sm:h-12 md:h-14 bg-white/20 rounded-xl animate-pulse max-w-lg mx-auto" />
          <div className="h-5 bg-white/20 rounded animate-pulse max-w-sm mx-auto mt-4" />
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-10">
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 bg-slate-200 dark:bg-gray-800 rounded-xl animate-pulse w-24" />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 bg-slate-200 dark:bg-gray-800 rounded-xl animate-pulse w-72" />
              <div className="h-9 bg-slate-200 dark:bg-gray-800 rounded-xl animate-pulse w-32" />
            </div>
          </div>

          <LoadingSkeleton type="card" count={6} />
        </div>
      </section>
    </div>
  );
}
