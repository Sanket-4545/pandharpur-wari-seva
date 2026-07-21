import GallerySkeleton from '@/components/GallerySkeleton';

export default function AdminGalleryLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl h-8 w-48" />
      <GallerySkeleton count={6} />
    </div>
  );
}
