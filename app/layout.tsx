import type { Metadata } from "next";
import "./globals.css";
import "./design-polish.css";
import "./experience.css";
import "./product-ui.css";
import "./marketing-refresh.css";
import "./comfort.css";
import "./accident-story.css";

export const metadata: Metadata = {
  title: "Accordia — Constat européen",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
