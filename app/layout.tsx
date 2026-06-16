import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RestaurantAI — Cardápio",
  description: "Cardápio com assistente IA, carrinho e checkout",
  icons: {
    icon: "/img/favicon.gif",
    shortcut: "/img/favicon.gif",
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
        <main className="site-main">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
