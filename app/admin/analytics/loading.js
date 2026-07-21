import DashboardSkeleton from '@/components/DashboardSkeleton';

export default function AdminAnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl h-8 w-48" />
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl h-9 w-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-pulse bg-slate-200 dark:bg-gray-800 rounded-3xl h-64" />
        <div className="animate-pulse bg-slate-200 dark:bg-gray-800 rounded-3xl h-64" />
      </div>
    </div>
  );
}
