import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function LostFoundLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
      <div className="animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl h-8 w-64" />
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl h-9 w-28" />
        ))}
      </div>
      <LoadingSkeleton type="card" count={6} />
    </div>
  );
}
