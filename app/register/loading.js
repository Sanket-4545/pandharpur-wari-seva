import FormSkeleton from '@/components/FormSkeleton';

export default function RegisterLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div className="animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl h-8 w-64" />
      <FormSkeleton fields={8} />
    </div>
  );
}
