import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function AdminProfileLoading() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton type="card" />
      <LoadingSkeleton type="card" />
    </div>
  );
}
