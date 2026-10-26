import type { Metadata } from "next";
import "./globals.css";
import { COMMIT_DO_SITE } from "@/lib/versao";

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
        {/* Carimbo de versao, INVISIVEL. Ele existe porque o push no
            GitHub nao publica este site e os dados chegam sozinhos, entao
            a tela pode estar velha com a edicao de hoje sem nada parecer
            quebrado. Mas e' informacao de manutencao, nao de leitura: em
            26/10 ele estava no rodape e o analista pediu para tirar da
            pagina que ele manda para cliente. Fica aqui e no
            /versao.json, que respondem a um curl ou a uma leitura do DOM
            sem ocupar um pixel da tela. */}
        <meta name="x-site-commit" content={COMMIT_DO_SITE} />
      </head>
      <body>{children}</body>
    </html>
  );
}
