import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function AdminReportsLoading() {
  return (
    <div className="space-y-4">
      <div className="animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl h-8 w-48" />
      <LoadingSkeleton type="card" count={3} />
    </div>
  );
}
