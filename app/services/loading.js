export default function ServicesLoading() {
  const shimmer = "animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl";

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <section className="relative min-h-[30vh] md:min-h-[35vh] flex flex-col justify-center py-16 overflow-hidden bg-gradient-to-br from-slate-300 to-slate-400 dark:from-gray-700 dark:to-gray-600">
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className={`h-4 w-24 mx-auto mb-6 rounded-full ${shimmer}`} />
          <div className={`h-10 w-72 mx-auto rounded-xl ${shimmer}`} />
          <div className={`h-4 w-56 mx-auto mt-4 rounded-lg ${shimmer}`} />
        </div>
      </section>
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6.5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className={`w-13 h-13 rounded-2xl bg-slate-200 dark:bg-gray-700 animate-pulse mb-5.5`} />
                <div className={`h-5 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mb-3`} />
                <div className={`h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-full`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
