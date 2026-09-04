import './globals.css';

import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import { Suspense } from 'react';

import { canonicalUrl, SCHEMA_ORG, SITE_URL } from '@/config/constants';
import { CookieConsentBanner } from '@/features/landing/components/cookie-consent/banner';

import { I18nProvider } from './i18n-provider';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

const siteDescription =
  "Un agent de recherche pour vos documents juridiques, financiers et médicaux : le modèle n'est jamais entraîné sur vos données, réponses citées à la page, déploiement dans votre périmètre.";
const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
const gaId = process.env.NEXT_PUBLIC_GA_ID;

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Prosperify - L'agent de recherche pour les documents de votre métier",
  description: siteDescription,
  icons: {
    apple: '/assets/logo.png',
    icon: [{ url: '/favicon.ico', sizes: '48x48' }],
  },
  alternates: {
    canonical: canonicalUrl('/'),
  },
  openGraph: {
    title: "Prosperify - L'agent de recherche de vos documents métier",
    description:
      'Interrogez vos documents juridiques, financiers ou médicaux avec un modèle jamais entraîné sur vos données, des réponses citées à la page et un déploiement souverain.',
    url: SITE_URL,
    siteName: 'Prosperify',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Prosperify - L'agent de recherche de vos documents métier",
    description:
      'Interrogez vos documents juridiques, financiers ou médicaux avec un modèle jamais entraîné sur vos données, des réponses citées à la page et un déploiement souverain.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://prosperify.app" />
        <link rel="dns-prefetch" href="https://static.cloudflareinsights.com" />
        {gtmId || gaId ? (
          <>
            <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
            <link rel="preconnect" href="https://www.googletagmanager.com" />
          </>
        ) : null}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                var theme = localStorage.getItem("prosperify-theme") === "dark" ? "dark" : "light";
                var language = localStorage.getItem("prosperify-language") === "en" ? "en" : "fr";
                localStorage.setItem("prosperify-theme", theme);
                localStorage.setItem("prosperify-language", language);
                document.documentElement.classList.toggle("dark", theme === "dark");
                document.documentElement.dataset.lang = language;
                document.documentElement.lang = language;
              } catch(e) {}
            })();
          `,
          }}
        />
        {gtmId || gaId ? (
          <Script id="analytics-loader" strategy="afterInteractive">
            {`
            (function() {
              try {
                window.dataLayer = window.dataLayer || [];
                window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

                var granted = document.cookie.split(';').some(function(c) {
                  return c.trim() === 'cookie_consent=accepted';
                });

                window.gtag('consent', 'default', {
                  ad_storage: 'denied',
                  ad_personalization: 'denied',
                  ad_user_data: 'denied',
                  analytics_storage: 'denied',
                  functionality_storage: 'granted',
                  security_storage: 'granted',
                  wait_for_update: 500
                });

                if (granted) {
                  window.gtag('consent', 'update', {
                    ad_storage: 'granted',
                    ad_personalization: 'granted',
                    ad_user_data: 'granted',
                    analytics_storage: 'granted'
                  });
                }
                ${
                  gtmId
                    ? `
                window.__gtmId = '${gtmId}';

                if (!document.querySelector('script[data-gtm-id="${gtmId}"]')) {
                  var g = document.createElement('script');
                  g.async = true;
                  g.setAttribute('data-gtm-id', '${gtmId}');
                  g.src = 'https://www.googletagmanager.com/gtm.js?id=${gtmId}';
                  document.head.appendChild(g);
                }
                `
                    : ''
                }
                ${
                  gaId
                    ? `
                window.gtag('js', new Date());
                window.gtag('config', '${gaId}');

                if (!document.querySelector('script[data-ga-id="${gaId}"]')) {
                  var s = document.createElement('script');
                  s.async = true;
                  s.setAttribute('data-ga-id', '${gaId}');
                  s.src = 'https://www.googletagmanager.com/gtag/js?id=${gaId}';
                  document.head.appendChild(s);
                }
                `
                    : ''
                }
              } catch(e) {}
            })();
            `}
          </Script>
        ) : null}
      </head>
      <body
        className={`font-sans bg-white ${bodyFont.variable} ${jetbrainsMono.variable} antialiased dark:bg-neutral-950`}
        suppressHydrationWarning
      >
        {/* Sans JavaScript, les sections ne doivent pas rester masquées */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: '.pf-reveal{opacity:1!important;transform:none!important}',
            }}
          />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': SCHEMA_ORG,
              '@type': 'Organization',
              name: 'Prosperify',
              url: SITE_URL,
              description:
                'Agent de recherche pour les documents juridiques, financiers et médicaux : modèle jamais entraîné sur vos données, réponses citées à la page, déploiement dans votre périmètre.',
              logo: `${SITE_URL}/assets/brand/logo-icon.png`,
              sameAs: ['https://www.linkedin.com/company/prosperify-ai/'],
              knowsAbout: [
                'Agent de recherche documentaire',
                'Documents juridiques',
                'Documents médicaux',
                'Documents financiers',
                'Recherche hybride',
                'Confidentialité des données',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                url: `${SITE_URL}/#contact`,
                contactType: 'sales',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': SCHEMA_ORG,
              '@type': 'WebSite',
              name: 'Prosperify',
              url: SITE_URL,
              description:
                'Agent de recherche pour les documents juridiques, financiers et médicaux.',
              inLanguage: ['fr', 'en'],
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': SCHEMA_ORG,
              '@type': 'SoftwareApplication',
              name: 'Prosperify',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description:
                'Agent de recherche pour les documents juridiques, financiers et médicaux : modèle jamais entraîné sur vos données, réponses citées à la page, déploiement dans votre périmètre.',
              url: SITE_URL,
              offers: {
                '@type': 'Offer',
                url: `${SITE_URL}/#products`,
                priceCurrency: 'EUR',
                availability: 'https://schema.org/InStock',
              },
            }),
          }}
        />
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        ) : null}

        <I18nProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <CookieConsentBanner />
        </I18nProvider>
      </body>
    </html>
  );
}
