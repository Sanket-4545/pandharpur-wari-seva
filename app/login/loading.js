export default function LoginLoading() {
  const shimmer = "animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className={`w-16 h-16 mx-auto rounded-2xl ${shimmer}`} />
          <div className={`h-7 w-48 mx-auto rounded-lg ${shimmer}`} />
          <div className={`h-4 w-64 mx-auto rounded-lg ${shimmer}`} />
        </div>
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-8 space-y-5">
          <div className={`h-10 w-full rounded-xl ${shimmer}`} />
          <div className={`h-10 w-full rounded-xl ${shimmer}`} />
          <div className={`h-10 w-full rounded-xl ${shimmer}`} />
        </div>
      </div>
    </div>
  );
}
