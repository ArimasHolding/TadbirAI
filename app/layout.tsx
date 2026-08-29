import type { Metadata } from "next";
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

export const metadata: Metadata = {
  title: "Tadbir AI | Tableau de bord",
  description: "Plateforme ERP & Facturation Intelligente Tadbir AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400..700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-fraunces: 'Fraunces', serif;
            --font-inter: 'Inter', sans-serif;
            --font-plex-mono: 'IBM Plex Mono', monospace;
          }
        `}} />
      </head>
      <body suppressHydrationWarning className="font-sans text-slate-100 bg-[#070a12] min-h-screen antialiased overflow-hidden relative">
        {/* Spatial Background Glows & Grid */}
        <div className="fixed inset-0 z-0 bg-dot-grid opacity-20 pointer-events-none" />
        <div className="fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />
        <div className="fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[140px] pointer-events-none" />

        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
