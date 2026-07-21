import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function AboutLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <LoadingSkeleton type="text" count={3} />
      <LoadingSkeleton type="card" count={3} />
    </div>
  );
}
