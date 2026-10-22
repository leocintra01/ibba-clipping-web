import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TMT Daily News · Itaú BBA",
  description:
    "Clipping diário de telecom, mídia e tecnologia para o Itaú BBA.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Serifa para o que se le, sans para o que se opera. Os dois pesos de
            cada uma, e nada alem disso: fonte e' peso de carregamento numa
            pagina que abre as 6h30 no celular. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#fbfaf7" />
      </head>
      <body>{children}</body>
    </html>
  );
}
