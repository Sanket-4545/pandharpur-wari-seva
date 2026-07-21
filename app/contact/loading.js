import FormSkeleton from '@/components/FormSkeleton';

export default function ContactLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FormSkeleton fields={4} />
        <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-premium space-y-4">
          <div className="animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl h-48 w-full" />
          <div className="animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
