export default function FAQLoading() {
  const shimmer = "animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl";

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <section className="relative min-h-[30vh] md:min-h-[35vh] flex flex-col justify-center py-16 overflow-hidden bg-gradient-to-br from-slate-300 to-slate-400 dark:from-gray-700 dark:to-gray-600">
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className={`h-4 w-24 mx-auto mb-6 rounded-full ${shimmer}`} />
          <div className={`h-10 w-64 mx-auto rounded-xl ${shimmer}`} />
          <div className={`h-4 w-80 mx-auto mt-4 rounded-lg ${shimmer}`} />
        </div>
      </section>
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-3xl mx-auto space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border rounded-2xl bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800">
                <div className="px-6 py-5">
                  <div className={`h-5 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-3/4`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
