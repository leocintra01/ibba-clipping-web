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

Toda leitura passa por `src/lib/edicoes.ts`. A listagem vem de
`data/index.json`, o manifesto que o robô grava a cada run, lido **pela rede**
(raw.githubusercontent, sem limite de chamada); cada edição vem do seu
`edicao-*.json`, também pela rede. Edição nova aparece sozinha em até 5
minutos, sem deploy.

O disco (`/data` do build) é só plano B. Quando a listagem cai nele, a página
mostra ao leitor que pode estar atrasada, e o meta `x-origem-listagem` diz
`manifesto`, `api` ou `disco`.

## Rodar local

```bash
npm install
npm run dev
```

Precisa de pelo menos um `data/edicao-*.json` para a home ter o que mostrar.

## Publicação

- **Dado** (edição nova): chega sozinho, pelo passo "Push JSON pro site" do
  workflow do `IBBA-Clipping`, que grava a edição e o manifesto aqui. O passo
  "Aquecer o site" confere, no mesmo run, que a home e o histórico já servem
  a edição nova.
- **Código** (o que está em `src/`): o push no GitHub **não** publica — o
  Vercel não está ligado a este repositório. O deploy é feito por CLI:

  ```bash
  npx --yes vercel@65.4.0 deploy --prod --yes
  ```

  Para confirmar que chegou, `https://ibba-clipping-web.vercel.app/versao.json`
  tem que mostrar o commit novo (o meta `x-site-commit` diz o mesmo).
