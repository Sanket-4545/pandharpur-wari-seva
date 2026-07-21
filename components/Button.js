import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  href, 
  className = '', 
  size = 'md',
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-heading font-semibold rounded-xl transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark shadow-saffron-glow focus:ring-primary/50",
    secondary: "border-2 border-secondary text-secondary hover:bg-secondary hover:text-white focus:ring-secondary/50",
    outline: "border-2 border-slate-200 text-charcoal hover:bg-slate-50 focus:ring-slate-400",
    glass: "backdrop-blur-md bg-white/10 text-white border border-white/20 hover:bg-white/25 focus:ring-white/50",
    link: "text-primary hover:underline hover:text-primary-dark p-0 focus:ring-primary/30"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const currentSize = variant === 'link' ? '' : sizes[size];
  const currentVariant = variants[variant] || variants.primary;
  const combinedStyles = `${baseStyles} ${currentVariant} ${currentSize} ${className}`;

  if (href) {
    return (
      <a href={href} className={combinedStyles} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={combinedStyles} {...props}>
      {children}
    </button>
  );
}
