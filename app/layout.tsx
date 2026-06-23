import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { SerwistProvider } from "@serwist/next/react";
import { AppShell } from "@/components/AppShell";
import { SiteHeader } from "@/components/SiteHeader";
import { FAVICON_URL } from "@/lib/constants";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const APP_NAME = "RestaurantAI";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: "RestaurantAI — Cardápio",
  description: "Cardápio com assistente IA, carrinho e checkout",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: FAVICON_URL,
    shortcut: FAVICON_URL,
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <SerwistProvider swUrl="/sw.js">
          <Suspense
            fallback={
              <header className="sticky top-0 z-[10000] min-h-14 border-b border-neutral-800 bg-brand" />
            }
          >
            <SiteHeader />
          </Suspense>
          <AppShell>
            <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">{children}</main>
          </AppShell>
          <Analytics />
        </SerwistProvider>
      </body>
    </html>
  );
}
