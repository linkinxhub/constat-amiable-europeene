import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Accordia — Constat européen",
  description: "Préparez votre dossier automobile en français, anglais, allemand et néerlandais.",
  other: {
    "codex-preview": "development",
  },
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
