// Escreve public/versao.json com o commit e a data do build.
//
// Existe por causa de um buraco de processo: o push no GitHub NAO publica este
// site (o `vercel git connect` nunca foi concluido), e os DADOS chegam sozinhos
// porque `src/lib/edicoes.ts` busca as edicoes em tempo de execucao. Entao a
// tela pode estar velha com a edicao de hoje e nada parecer quebrado — foi
// isso que fez dois consertos nao chegarem ao leitor em 25/10/2026.
//
// Com o arquivo, conferir em producao e' um curl:
//     curl -s https://ibba-clipping-web.vercel.app/versao.json
// comparado com `git rev-parse --short=7 HEAD` aqui.
//
// Roda no `prebuild`, entao funciona tanto no deploy por CLI quanto num deploy
// ligado ao Git. No Vercel o commit vem de VERCEL_GIT_COMMIT_SHA; local, do git.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, "..");

function commit() {
  const doAmbiente =
    process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || "";
  if (doAmbiente) return doAmbiente.slice(0, 7);
  try {
    return execFileSync("git", ["rev-parse", "--short=7", "HEAD"], {
      cwd: raiz,
      encoding: "utf8",
    }).trim();
  } catch {
    return "?";
  }
}

const dados = {
  commit: commit(),
  build_em: new Date().toISOString(),
  branch: process.env.VERCEL_GIT_COMMIT_REF || "",
};

// Dois destinos, e os dois sao necessarios:
//
//   public/versao.json  — para conferir com um curl, sem abrir o navegador.
//   src/lib/versao.ts   — para a TELA. Ler arquivo dentro de um componente de
//                         servidor quebra o prerender com `cacheComponents`
//                         ligado ("uncached data during prerendering"), e eu vi
//                         esse erro no console antes de publicar. Como modulo,
//                         o valor e' constante de build e nao existe leitura
//                         em tempo de render.
const destino = resolve(raiz, "public", "versao.json");
mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, JSON.stringify(dados, null, 2) + "\n", "utf8");

const ts = resolve(raiz, "src", "lib", "versao.ts");
mkdirSync(dirname(ts), { recursive: true });
writeFileSync(
  ts,
  "// GERADO por scripts/gerar-versao.mjs no prebuild. Nao editar a mao.\n" +
    `export const COMMIT_DO_SITE = ${JSON.stringify(dados.commit)};\n` +
    `export const BUILD_EM = ${JSON.stringify(dados.build_em)};\n`,
  "utf8",
);
console.log(`versao: ${dados.commit} (${dados.build_em})`);
