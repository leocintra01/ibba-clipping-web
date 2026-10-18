# IBBA · TMT Daily News — site

Front-end do clipping diário de TMT do Itaú BBA, publicado no Vercel.

## Como funciona

O **robô não mudou**: ele continua rodando em `IBBA-Clipping` (GitHub Actions,
3 execuções por dia disparadas pelo cron do Cloudflare Worker) e continua
publicando o HTML no repositório `leocintra01/clipping`, que segue intocado
como backup.

O que mudou é que o robô passou a emitir também `edicao-AAAA-MM-DD.json`: dado
puro, sem apresentação embutida. Este app lê esse JSON e decide como mostrar.

```
gerar_clipping.py ──┬─► clipping-*.html ──► leocintra01/clipping  (backup)
                    └─► edicao-*.json   ──► /data deste repo      ──► Vercel
```

## Camada de dados

Toda leitura passa por `src/lib/edicoes.ts`. Hoje ela lê arquivos de `/data`;
quando migrar para Supabase, **só esse arquivo muda** — por isso as funções já
são assíncronas mesmo lendo disco.

## Rodar local

```bash
npm install
npm run dev
```

Precisa de pelo menos um `data/edicao-*.json` para a home ter o que mostrar.

## Pendências de configuração (precisam de você)

Duas coisas que eu não consigo fazer sozinho. Enquanto elas não acontecem, o
site fica no ar com a edição que já está publicada, mas **não se atualiza
sozinho** a cada run do robô.

### 1. Ligar o Vercel ao GitHub (recomendado, uma vez só)

`vercel git connect` falhou com:

> You need to add a Login Connection to your GitHub account first.

A conta do Vercel não tem conexão com o GitHub. Em
**vercel.com → Settings → Login Connections**, conecte o GitHub. Depois disso:

```bash
cd C:\ibba-clipping-web
npx vercel git connect
```

A partir daí todo push no repositório publica sozinho — mesmo padrão do
Dashboard.

**Alternativa**, se preferir não conectar: criar um token em
vercel.com → Settings → Tokens, guardá-lo como secret `VERCEL_TOKEN` no
repositório `IBBA-Clipping`, e me avisar — eu adiciono o passo de deploy no
workflow.

### 2. Conferir o alcance do `CLIPPING_PUSH_TOKEN`

O workflow usa o mesmo token que já publica o HTML para mandar o JSON a este
repositório. Se ele for um token *fine-grained* restrito a
`leocintra01/clipping`, não vai alcançar aqui — o passo avisa no log e segue,
sem derrubar a edição.

Como saber: no run seguinte, procure no log o passo
**"Push JSON pro site"**. Se disser `Site atualizado com edicao-*.json`, está
tudo certo.
