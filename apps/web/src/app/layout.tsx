import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Dashboard Économique INSEE',
  description: 'Tableau de bord interactif des indicateurs économiques français et européens',
  keywords: 'INSEE, économie, statistiques, PIB, chômage, inflation, France, Europe',
  authors: [{ name: 'Dashboard économique' }],
  creator: 'Dashboard économique',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://dashboard-economique.vercel.app',
    title: 'Dashboard Économique INSEE',
    description: 'Visualisez les dernières données économiques françaises et européennes',
    siteName: 'Dashboard Économique',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard Économique INSEE',
    description: 'Visualisez les dernières données économiques françaises et européennes',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.variable} font-sans antialiased h-full bg-gray-50`}>
        <div className="min-h-full">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">
                    📊 Dashboard Économique
                  </h1>
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    INSEE • Eurostat
                  </span>
                </div>
                
                <nav className="hidden md:flex space-x-6">
                  <a href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Accueil
                  </a>
                  <a href="/donnees" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Données
                  </a>
                  <a href="/api-docs" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    API
                  </a>
                </nav>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Sources de données
                  </h3>
                  <ul className="mt-4 space-y-2">
                    <li>
                      <a 
                        href="https://api.insee.fr" 
                        className="text-sm text-gray-600 hover:text-gray-900"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        API INSEE
                      </a>
                    </li>
                    <li>
                      <a 
                        href="https://ec.europa.eu/eurostat" 
                        className="text-sm text-gray-600 hover:text-gray-900"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Eurostat
                      </a>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Fonctionnalités
                  </h3>
                  <ul className="mt-4 space-y-2">
                    <li className="text-sm text-gray-600">Visualisations interactives</li>
                    <li className="text-sm text-gray-600">Export PDF/CSV</li>
                    <li className="text-sm text-gray-600">Données temps réel</li>
                    <li className="text-sm text-gray-600">API REST</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    À propos
                  </h3>
                  <p className="mt-4 text-sm text-gray-600">
                    Dashboard open-source pour visualiser les indicateurs économiques 
                    français et européens en temps réel.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  © 2025 Dashboard Économique. Données fournies par l'INSEE et Eurostat.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
