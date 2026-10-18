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
