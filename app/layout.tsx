import {Suspense} from 'react';
import {FeedbackEntry} from '@/features/feedback/entry';
import './feedback.css';
import type { Metadata } from "next";
import "./globals.css";
import "./design-polish.css";
import "./experience.css";
import "./product-ui.css";
import "./marketing-refresh.css";
import "./comfort.css";
import "./accident-story.css";

export const metadata: Metadata = {
  title: "Accordia Recette",
  robots: { index: false, follow: false },
  description: "Préparez votre constat européen à deux, dans la langue de chacun, avec photos, relecture et PDF.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased"><div role="note" style={{padding: "0.5rem 1rem", background: "#102850", color: "white", textAlign: "center"}}>Accordia Recette · Test data only</div>{children}<Suspense fallback={null}><FeedbackEntry/></Suspense></body>
    </html>
  );
}
