# MarketPulse

L'actualité boursière organisée par secteur, pour les investisseurs particuliers francophones.
Next.js 15 (App Router) · Tailwind CSS · SWR · TradingView Lightweight Charts.

## Démarrage

```bash
npm install
cp .env.example .env.local   # facultatif : sans clé, le site tourne en mode démo
npm run dev                  # http://localhost:3000
```

Sans clé API, le site est en **mode démo**. Les cours, actualités et événements sont fictifs mais
réalistes et déterministes, et ils évoluent minute par minute. Un badge « DÉMO » est alors visible
en permanence.

## Structure

```
config/
  categories.ts   ← règles de classement : secteurs, valeurs suivies, mots-clés
  instruments.ts  ← univers des valeurs (nom, ticker, alias, symboles fournisseurs)
  feeds.ts        ← flux RSS
  events.ts       ← événements saisis à la main (BCE, Fed…)
lib/
  market/         ← mock.ts (démo), finnhub.ts, twelvedata.ts, index.ts (choix de la source)
  news/           ← agrégation RSS/API, classify.ts (classement), dedupe.ts (fusion des doublons)
  events.ts       ← agenda (résultats, salons, réglementaire, macro)
  cache.ts        ← cache mémoire TTL + repli sur la dernière valeur si une source tombe
  store.ts        ← favoris, watchlist, catégories perso (localStorage)
app/              ← pages (/, /categorie/[slug], /valeur/[symbol], /recherche, /watchlist, /mes-categories) + routes /api/*
```

## Brancher les vraies API

Renseignez les clés dans `.env.local` (ou dans les variables d'environnement de l'hébergeur), puis
redémarrez le serveur. Dès qu'une clé de marché est présente, le site passe en mode **live**.
Pour forcer un mode, utilisez `DATA_MODE=demo|live`.

| Variable | Rôle | Utilisée pour |
|---|---|---|
| `FINNHUB_API_KEY` | cotations, capitalisation, PER, dividende, news, agenda des résultats | finnhub.io |
| `TWELVEDATA_API_KEY` | historiques (graphiques, sparklines, perf. semaine/mois/année), cotation de secours | twelvedata.com |
| `NEWSAPI_KEY` | actualités complémentaires en français | newsapi.org |
| `NEWS_RSS_ENABLED` | active les flux RSS (`true` par défaut) | config/feeds.ts |

**En mode live, aucune donnée fictive n'est mélangée aux vraies.** Une donnée indisponible s'affiche
« — », et un bandeau orange indique quelle source est en panne. Si une source échoue, le cache sert
la dernière valeur connue, signalée par un point orange à côté du cours.

Points d'attention :
- **Couverture des offres gratuites.** Finnhub gratuit couvre surtout les actions US. Les valeurs
  européennes, les indices et le forex demandent souvent une offre payante. Si un symbole diffère
  chez le fournisseur, renseignez `providers: { finnhub: "...", twelvedata: "..." }` dans
  `config/instruments.ts`.
- **Quotas.** Twelve Data gratuit est limité à 8 requêtes/minute. Les historiques quotidiens sont
  mis en cache 6 h, mais le premier chargement d'un secteur peut prendre plusieurs minutes avant
  d'être complet.
- **Rafraîchissement.** Côté navigateur, les cours sont relus toutes les 60 s et les actualités toutes
  les 5 min (SWR). Côté serveur, les mêmes durées s'appliquent via `lib/cache.ts`. En production
  multi-instances, remplacez ce cache par Redis ou Upstash : l'interface `cached()` reste la même.
- **Flux RSS.** Les URL de `config/feeds.ts` sont à vérifier, car les éditeurs les changent. Une
  source en erreur est ignorée et signalée, sans bloquer les autres.
- **Autres fournisseurs** (Alpha Vantage, Financial Modeling Prep) : créez un fichier dans
  `lib/market/` qui implémente une cotation et un historique, puis appelez-le dans `liveQuote()` et
  `getHistory()` de `lib/market/index.ts`.

## Ajouter une catégorie

1. Ajoutez les valeurs manquantes dans `config/instruments.ts`. Pensez aux `aliases`, c'est-à-dire
   les marques et dirigeants cités dans la presse.
2. Ajoutez un bloc dans `config/categories.ts` :

```ts
{
  slug: "semis",                 // URL : /categorie/semis
  name: "Semi-conducteurs",
  shortName: "Semis",
  icon: "🔌",
  color: "#10b981",              // couleur d'accent
  description: "Fondeurs, concepteurs de puces et équipementiers.",
  symbols: ["NVDA", "AMD", "TSM", "ASML.AS", "STMPA.PA"],
  keywords: ["semi-conducteur", "semi-conducteurs", "puces", "fonderie", "wafer"],
},
```

C'est tout. Le menu, la heatmap, la page, le fil d'actualités filtré et l'agenda sont générés
automatiquement.

Les mots-clés sont comparés sans tenir compte des accents ni de la casse, et sur des mots entiers.
Un article est rattaché à toutes les catégories dont il mentionne une valeur ou un mot-clé. Les
doublons sont fusionnés lorsque leurs titres sont proches (Jaccard ≥ 0,6), qu'ils concernent les
mêmes sociétés et qu'ils ont été publiés à moins de 18 h d'intervalle.

Les utilisateurs peuvent aussi créer leurs propres catégories depuis l'interface (`/mes-categories`).
Elles sont stockées dans leur navigateur.
