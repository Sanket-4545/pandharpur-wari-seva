import GallerySkeleton from '@/components/GallerySkeleton';

export default function GalleryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
      <div className="animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl h-8 w-48" />
      <div className="animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl h-4 w-96" />
      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl h-9 w-24" />
        ))}
      </div>
      <GallerySkeleton count={6} />
    </div>
  );
}
