import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { CookieConsent } from "@/components/consent/CookieConsent";
import { RecentPromptsDrawerHost } from "@/components/RecentPromptsDrawerHost";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { rootMetadata } from "@/lib/seo/metadata";
import "./globals.css";
import "./landing.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = rootMetadata;

function AppInitScript() {
  const code = `
(() => {
  try {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    const palettes = ['tranquil','romantic','playful','neutral','monochrome','seasonal','nature'];
    const savedPalette = localStorage.getItem('promptperfect:palette');
    if (palettes.indexOf(savedPalette) >= 0) document.documentElement.dataset.palette = savedPalette;
    else delete document.documentElement.dataset.palette;
    document.documentElement.style.setProperty('--mindtune-delay', -(Date.now() % 8000) + 'ms');
  } catch {}
})();`.trim();

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning style={{ colorScheme: 'dark' }}>
      <head>
        <AppInitScript />
      </head>
      <body
        className={`${jakarta.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <SiteJsonLd />
        <ToastProvider>
          {children}
          <RecentPromptsDrawerHost />
          <CookieConsent />
        </ToastProvider>
      </body>
    </html>
  );
}
