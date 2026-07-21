import React from 'react';

export default function SectionTitle({ 
  title, 
  subtitle, 
  align = 'center', 
  className = '' 
}) {
  const isCenter = align === 'center';
  
  return (
    <div className={`mb-12 md:mb-16 ${isCenter ? 'text-center' : 'text-left'} ${className}`}>
      <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-charcoal tracking-tight">
        {title}
      </h2>
      <div className={`mt-4 h-1.5 w-20 bg-primary rounded-full ${isCenter ? 'mx-auto' : 'mr-auto'}`} />
      {subtitle && (
        <p className={`mt-5 text-lg text-charcoal-light leading-relaxed ${isCenter ? 'max-w-2xl mx-auto' : 'max-w-xl'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
