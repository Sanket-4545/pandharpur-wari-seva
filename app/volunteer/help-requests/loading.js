export default function HelpRequestsLoading() {
  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <section className="relative min-h-[30vh] md:min-h-[35vh] flex flex-col justify-center py-16 overflow-hidden bg-gradient-to-br from-red-500 to-rose-600">
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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-200 dark:bg-gray-700 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-slate-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
