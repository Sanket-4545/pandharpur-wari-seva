export default function sitemap() {
  const baseUrl = 'https://wari-nss-seva-portal.vercel.app';
  const routes = [
    '', '/about', '/services', '/emergency-contacts', '/gallery', '/faq', '/contact',
    '/admin', '/admin/missing-persons', '/admin/lost-found', '/admin/volunteers',
    '/admin/emergency-contacts', '/admin/gallery', '/admin/announcements',
    '/admin/reports', '/admin/analytics', '/admin/settings', '/admin/profile',
  ];
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route.startsWith('/admin') ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/admin') ? 0.7 : 0.8,
  }));
}
