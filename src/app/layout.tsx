import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IBBA · TMT Daily News",
  description:
    "Clipping diario de telecom, midia e tecnologia para o Itau BBA.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#1a1916" />
      </head>
      <body>{children}</body>
    </html>
  );
}
