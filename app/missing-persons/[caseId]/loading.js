import Container from '@/components/Container';

export default function MissingPersonDetailLoading() {
  const shimmer = "animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 pb-20">
      <div className="animate-pulse">
        <div className={`h-[40vh] bg-slate-200 dark:bg-gray-800`} />
        <Container>
          <div className="-mt-20 relative z-10 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-8 max-w-3xl mx-auto space-y-6">
              <div className={`h-8 w-2/3 mx-auto ${shimmer}`} />
              <div className={`h-4 w-1/3 mx-auto ${shimmer}`} />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-20 ${shimmer} rounded-xl`} />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
