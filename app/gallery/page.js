"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Container from '@/components/Container';
import HeroBanner from '@/components/HeroBanner';
import GalleryFilter from '@/components/GalleryFilter';
import GalleryCard from '@/components/GalleryCard';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GalleryPage() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  const categories = [
    { key: 'all', labelKey: 'gallery_page.filter_all' },
    { key: 'wari', labelKey: 'gallery_page.filter_wari' },
    { key: 'nss', labelKey: 'gallery_page.filter_nss' },
    { key: 'medical', labelKey: 'gallery_page.filter_medical' },
    { key: 'volunteers', labelKey: 'gallery_page.filter_volunteers' },
    { key: 'pilgrims', labelKey: 'gallery_page.filter_pilgrims' },
    { key: 'events', labelKey: 'gallery_page.filter_events' }
  ];

  // 12 mock images distributed across categories
  const images = [
    { id: 1, category: 'wari', src: '/images/gallery_wari.png', titleKey: 'about.image_alt' },
    { id: 2, category: 'nss', src: '/images/nss_volunteers_seva.png', titleKey: 'about.role' },
    { id: 3, category: 'medical', src: '/images/wari_pilgrimage_hero.png', titleKey: 'services.medical_assistance' },
    { id: 4, category: 'volunteers', src: '/images/nss_volunteers_seva.png', titleKey: 'stats.volunteers' },
    { id: 5, category: 'pilgrims', src: '/images/gallery_wari.png', titleKey: 'stats.assisted' },
    { id: 6, category: 'events', src: '/images/wari_pilgrimage_hero.png', titleKey: 'about_page.timeline.velapur.title' },
    
    { id: 7, category: 'wari', src: '/images/wari_pilgrimage_hero.png', titleKey: 'about_page.timeline.alandi.title' },
    { id: 8, category: 'nss', src: '/images/gallery_wari.png', titleKey: 'cta.title' },
    { id: 9, category: 'medical', src: '/images/nss_volunteers_seva.png', titleKey: 'stats.support' },
    { id: 10, category: 'volunteers', src: '/images/gallery_wari.png', titleKey: 'about_page.medical_help' },
    { id: 11, category: 'pilgrims', src: '/images/nss_volunteers_seva.png', titleKey: 'about_page.crowd_management' },
    { id: 12, category: 'events', src: '/images/wari_pilgrimage_hero.png', titleKey: 'about_page.timeline.pandharpur.title' }
  ];

  // Filter items
  const filteredImages = activeCategory === 'all' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  // Pagination config
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  
  // Slice active items
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedImages = filteredImages.slice(startIndex, startIndex + itemsPerPage);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <HeroBanner 
        titleKey="gallery_page.title" 
        subtitleKey="gallery_page.subtitle"
        bgImage="/images/gallery_wari.png"
      />

      <section className="py-16 md:py-24">
        <Container>
          {/* Filters */}
          <GalleryFilter 
            categories={categories} 
            activeCategory={activeCategory} 
            onSelect={handleCategoryChange} 
          />

          {/* Grid Layout */}
          {paginatedImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {paginatedImages.map((image) => (
                <GalleryCard 
                  key={image.id}
                  image={image}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-slate-400 dark:text-gray-500 font-semibold">No images found in this category.</p>
            </div>
          )}

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-16 select-none">
              {/* Prev Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800 text-charcoal dark:text-gray-300 hover:text-primary transition-all disabled:opacity-50 disabled:pointer-events-none"
                aria-label={t('gallery_page.prev')}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Number Pages */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const isActive = currentPage === page;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-xl font-heading font-bold text-sm transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary text-white shadow-saffron-glow' 
                        : 'bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-charcoal-light dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800 text-charcoal dark:text-gray-300 hover:text-primary transition-all disabled:opacity-50 disabled:pointer-events-none"
                aria-label={t('gallery_page.next')}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </Container>
      </section>

      {/* Modal Preview UI (UI Only) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-white dark:bg-gray-900 rounded-[2rem] border border-slate-800/20 dark:border-gray-700/50 max-w-4xl w-full p-2.5 shadow-2xl overflow-hidden animate-zoom-in">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-white hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label={t('gallery_page.close')}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="rounded-[1.75rem] overflow-hidden aspect-video bg-slate-950 max-h-[75vh]">
              <img 
                src={selectedImage.src} 
                alt={t('gallery_page.caption')}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Caption */}
            <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col text-center sm:text-left">
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">
                  {t(`gallery_page.filter_${selectedImage.category}`)}
                </span>
                <h4 className="font-heading font-extrabold text-lg text-charcoal dark:text-white tracking-tight mt-1">
                  {t(selectedImage.titleKey)}
                </h4>
              </div>
              <span className="text-xs text-slate-400 dark:text-gray-500 font-semibold select-none">
                Image ID: #{selectedImage.id}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
