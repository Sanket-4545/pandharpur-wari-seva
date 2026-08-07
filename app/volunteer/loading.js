import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function VolunteerLoading() {
  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <section className="relative min-h-[35vh] md:min-h-[40vh] flex flex-col justify-center py-16 overflow-hidden bg-gradient-to-br from-primary to-amber-600">
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-xs font-semibold mb-6">
            <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
          </div>
          <div className="h-10 sm:h-12 md:h-14 bg-white/20 rounded-xl animate-pulse max-w-md mx-auto" />
          <div className="h-5 bg-white/20 rounded animate-pulse max-w-sm mx-auto mt-4" />
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl mx-auto">
            <div className="h-6 bg-slate-200 dark:bg-gray-800 rounded-xl animate-pulse w-40 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 animate-pulse">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-gray-700 rounded-xl mb-4" />
                  <div className="h-5 bg-slate-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-full" />
                </div>
              ))}
            </div>

            <div className="h-6 bg-slate-200 dark:bg-gray-800 rounded-xl animate-pulse w-48 mb-6" />
            <LoadingSkeleton type="card" count={3} />
          </div>
        </div>
      </section>
    </div>
  );
}
