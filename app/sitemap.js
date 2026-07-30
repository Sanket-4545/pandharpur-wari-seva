export default function sitemap() {
  const baseUrl = 'https://wari-nss-seva-portal.vercel.app';
  const routes = [
    '', '/about', '/services', '/emergency-contacts', '/gallery', '/faq', '/contact',
    '/register', '/missing-persons', '/lost-found',
  ];
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
