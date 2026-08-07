"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const prevPathRef = useRef(pathname);
  const prevSearchParamsRef = useRef(searchParams?.toString() ?? "");

  useEffect(() => {
    function handleClick(e) {
      const anchor = e.target.closest("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return;
      if (anchor.target === "_blank") return;

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
      } catch {
        return;
      }

      const currentPath = window.location.pathname + window.location.search;
      const targetUrl = new URL(href, window.location.origin);
      const targetPath = targetUrl.pathname + targetUrl.search;
      if (targetPath === currentPath) return;

      if (timerRef.current) clearInterval(timerRef.current);

      setIsLoading(true);
      setProgress(0);
      setVisible(true);

      let p = 0;
      const tick = () => {
        p += Math.random() * 15 + 5;
        if (p > 90) p = 90;
        setProgress(p);
      };
      tick();
      timerRef.current = setInterval(tick, 200);
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  useEffect(() => {
    const pathChanged = pathname !== prevPathRef.current;
    const searchChanged = (searchParams?.toString() ?? "") !== prevSearchParamsRef.current;

    prevPathRef.current = pathname;
    prevSearchParamsRef.current = searchParams?.toString() ?? "";

    if ((pathChanged || searchChanged) && isLoading) {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setVisible(false);
        setProgress(0);
      }, 300);
    }
  }, [pathname, searchParams, isLoading]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      role="status"
      aria-live="polite"
      aria-label="Page loading"
    >
      <div
        className="h-[3px] bg-gradient-to-r from-primary via-amber-400 to-primary nav-progress-bar"
        style={{
          width: `${progress}%`,
          transition: "width 0.25s ease-out",
        }}
      />
    </div>
  );
}

export default function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBar />
    </Suspense>
  );
}
