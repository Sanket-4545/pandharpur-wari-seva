const shimmer = "animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl";

export default function RootLoading() {
  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen">
      <section className="relative min-h-[30vh] md:min-h-[35vh] flex flex-col justify-center py-16 overflow-hidden bg-gradient-to-br from-slate-300 to-slate-400 dark:from-gray-700 dark:to-gray-600">
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className={`h-4 w-32 mx-auto mb-6 rounded-full ${shimmer}`} />
          <div className={`h-10 sm:h-12 w-64 sm:w-96 mx-auto rounded-xl ${shimmer}`} />
          <div className={`h-4 w-48 sm:w-64 mx-auto mt-4 rounded-lg ${shimmer}`} />
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`h-6 w-48 mb-8 rounded-lg ${shimmer}`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium space-y-4">
                <div className={`h-4 w-3/4 ${shimmer}`} />
                <div className={`h-3 w-full ${shimmer}`} />
                <div className={`h-3 w-5/6 ${shimmer}`} />
                <div className={`h-3 w-2/3 ${shimmer}`} />
                <div className={`h-9 w-32 mt-4 rounded-2xl ${shimmer}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
