import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: {
    default: 'Pandharpur Wari NSS Seva Portal',
    template: '%s | Pandharpur Wari NSS Seva Portal',
  },
  description: 'Coordinate volunteer support, emergency assistance, medical camps, and pilgrim support systems during the annual holy Pandharpur Ashadhi Wari pilgrimage.',
  keywords: ['Pandharpur Wari', 'NSS', 'Seva Portal', 'Volunteer', 'Pilgrimage', 'Maharashtra', 'Ashadhi Wari', 'Vithoba'],
  authors: [{ name: 'NSS Coordination Committee' }],
  openGraph: {
    title: 'Pandharpur Wari NSS Seva Portal',
    description: 'Coordinate volunteer support, emergency assistance, medical camps, and pilgrim support systems during the annual holy Pandharpur Ashadhi Wari pilgrimage.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Pandharpur Wari NSS Seva Portal',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="flex flex-col min-h-screen">
        <LanguageProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </LanguageProvider>
      </body>
    </html>
  );
}

