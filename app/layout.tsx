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
          <Suspense fallback={<header className="site-header site-header--loading" />}>
            <SiteHeader />
          </Suspense>
          <AppShell>
            <main className="site-main">{children}</main>
          </AppShell>
          <Analytics />
        </SerwistProvider>
      </body>
    </html>
  );
}
