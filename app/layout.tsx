import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { SiteHeader } from "@/components/SiteHeader";
import { FAVICON_URL } from "@/lib/constants";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RestaurantAI — Cardápio",
  description: "Cardápio com assistente IA, carrinho e checkout",
  icons: {
    icon: FAVICON_URL,
    shortcut: FAVICON_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Suspense fallback={<header className="site-header site-header--loading" />}>
          <SiteHeader />
        </Suspense>
        <AppShell>
          <main className="site-main">{children}</main>
        </AppShell>
        <Analytics />
      </body>
    </html>
  );
}
