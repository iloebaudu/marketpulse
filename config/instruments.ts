/**
 * Univers des instruments suivis par MarketPulse.
 *
 * - `price`, `cap`, `pe`, `div`, `vol` servent UNIQUEMENT au mode démo (valeurs fictives
 *   de référence). En mode live, les données viennent des API.
 * - `aliases` : noms de marques/sociétés utilisés pour rattacher les actualités.
 * - `providers` : symbole à utiliser chez Finnhub / Twelve Data s'il diffère de `symbol`.
 *
 * Pour ajouter une valeur : ajoutez une entrée ici, puis référencez son `symbol`
 * dans une ou plusieurs catégories de config/categories.ts.
 */
import type { Instrument } from "@/lib/types";

export const INSTRUMENTS: Instrument[] = [
  // ─── Indices ─────────────────────────────────────────────────────────────
  { symbol: "FCHI", name: "CAC 40", exchange: "Euronext Paris", currency: "EUR", class: "index", price: 7950, vol: 0.15, group: "eu", aliases: ["CAC 40"], providers: { twelvedata: "CAC" } },
  { symbol: "GDAXI", name: "DAX", exchange: "Xetra", currency: "EUR", class: "index", price: 24100, vol: 0.16, group: "eu", aliases: ["DAX"], providers: { twelvedata: "DAX" } },
  { symbol: "GSPC", name: "S&P 500", exchange: "NYSE", currency: "USD", class: "index", price: 6720, vol: 0.15, group: "us", aliases: ["S&P 500", "S&P500"], providers: { twelvedata: "SPX" } },
  { symbol: "IXIC", name: "Nasdaq Composite", exchange: "Nasdaq", currency: "USD", class: "index", price: 22850, vol: 0.2, group: "us", aliases: ["Nasdaq"], providers: { twelvedata: "IXIC" } },
  { symbol: "DJI", name: "Dow Jones", exchange: "NYSE", currency: "USD", class: "index", price: 46900, vol: 0.14, group: "us", aliases: ["Dow Jones"], providers: { twelvedata: "DJI" } },
  { symbol: "N225", name: "Nikkei 225", exchange: "Tokyo", currency: "JPY", class: "index", price: 48300, vol: 0.2, group: "asia", aliases: ["Nikkei"], providers: { twelvedata: "N225" } },
  { symbol: "VIX", name: "VIX (volatilité S&P 500)", exchange: "CBOE", currency: "USD", class: "index", price: 18.5, vol: 0.9, group: "vol", aliases: ["VIX"], providers: { twelvedata: "VIX" } },
  { symbol: "DXY", name: "Dollar Index", exchange: "ICE", currency: "USD", class: "index", price: 99.4, vol: 0.07, group: "fx", aliases: ["dollar index"], providers: { twelvedata: "DXY" } },

  // ─── Changes & taux ─────────────────────────────────────────────────────
  { symbol: "EURUSD", name: "EUR/USD", exchange: "Forex", currency: "USD", class: "fx", price: 1.162, vol: 0.07, group: "fx", aliases: ["euro-dollar", "EUR/USD"], providers: { finnhub: "OANDA:EUR_USD", twelvedata: "EUR/USD" } },
  { symbol: "US10Y", name: "Taux US 10 ans", exchange: "Obligataire", currency: "%", class: "rate", price: 4.12, vol: 0.18, group: "rates", aliases: ["Treasuries", "taux à 10 ans américain"], providers: { twelvedata: "US10Y" } },
  { symbol: "DE10Y", name: "Bund 10 ans", exchange: "Obligataire", currency: "%", class: "rate", price: 2.66, vol: 0.2, group: "rates", aliases: ["Bund"], providers: { twelvedata: "DE10Y" } },
  { symbol: "FR10Y", name: "OAT 10 ans", exchange: "Obligataire", currency: "%", class: "rate", price: 3.41, vol: 0.18, group: "rates", aliases: ["OAT"], providers: { twelvedata: "FR10Y" } },

  // ─── Matières premières ──────────────────────────────────────────────────
  { symbol: "XAU", name: "Or", exchange: "Comex", currency: "USD", class: "commodity", price: 4060, vol: 0.18, group: "metals", unit: "$/once", aliases: ["métal jaune", "cours de l'or", "prix de l'or", "once d'or"], providers: { finnhub: "OANDA:XAU_USD", twelvedata: "XAU/USD" } },
  { symbol: "XAG", name: "Argent", exchange: "Comex", currency: "USD", class: "commodity", price: 50.2, vol: 0.3, group: "metals", unit: "$/once", aliases: ["cours de l'argent", "once d'argent", "métal argent"], providers: { finnhub: "OANDA:XAG_USD", twelvedata: "XAG/USD" } },
  { symbol: "BRENT", name: "Pétrole Brent", exchange: "ICE", currency: "USD", class: "commodity", price: 64.3, vol: 0.32, group: "oil", unit: "$/baril", aliases: ["Brent"], providers: { finnhub: "OANDA:BCO_USD", twelvedata: "BRENT" } },
  { symbol: "WTI", name: "Pétrole WTI", exchange: "Nymex", currency: "USD", class: "commodity", price: 60.1, vol: 0.34, group: "oil", unit: "$/baril", aliases: ["WTI"], providers: { finnhub: "OANDA:WTICO_USD", twelvedata: "WTI" } },
  { symbol: "NATGAS", name: "Gaz naturel", exchange: "Nymex", currency: "USD", class: "commodity", price: 3.9, vol: 0.55, group: "oil", unit: "$/MMBtu", aliases: ["gaz naturel"], providers: { twelvedata: "NG" } },
  { symbol: "COPPER", name: "Cuivre", exchange: "Comex", currency: "USD", class: "commodity", price: 4.95, vol: 0.24, group: "metals", unit: "$/livre", aliases: ["cuivre"], providers: { twelvedata: "HG1" } },
  { symbol: "LITHIUM", name: "Carbonate de lithium", exchange: "GFEX", currency: "CNY", class: "commodity", price: 76500, vol: 0.45, group: "metals", unit: "¥/tonne", aliases: ["lithium"] },

  // ─── Crypto ──────────────────────────────────────────────────────────────
  { symbol: "BTC-USD", name: "Bitcoin", exchange: "Crypto", currency: "USD", class: "crypto", price: 94500, cap: 1880, vol: 0.55, group: "crypto", aliases: ["Bitcoin", "BTC"], providers: { finnhub: "BINANCE:BTCUSDT", twelvedata: "BTC/USD" } },
  { symbol: "ETH-USD", name: "Ethereum", exchange: "Crypto", currency: "USD", class: "crypto", price: 3180, cap: 384, vol: 0.7, group: "crypto", aliases: ["Ethereum", "Ether"], providers: { finnhub: "BINANCE:ETHUSDT", twelvedata: "ETH/USD" } },
  { symbol: "SOL-USD", name: "Solana", exchange: "Crypto", currency: "USD", class: "crypto", price: 142, cap: 78, vol: 0.85, group: "crypto", aliases: ["Solana"], providers: { finnhub: "BINANCE:SOLUSDT", twelvedata: "SOL/USD" } },
  { symbol: "COIN", name: "Coinbase", exchange: "Nasdaq", currency: "USD", class: "stock", price: 298, cap: 76, pe: 26, div: 0, vol: 0.7, group: "crypto", aliases: ["Coinbase"] },
  { symbol: "MSTR", name: "Strategy (MicroStrategy)", exchange: "Nasdaq", currency: "USD", class: "stock", price: 232, cap: 66, pe: null, div: 0, vol: 0.8, group: "crypto", aliases: ["MicroStrategy", "Michael Saylor"] },

  // ─── Tech ────────────────────────────────────────────────────────────────
  { symbol: "AAPL", name: "Apple", exchange: "Nasdaq", currency: "USD", class: "stock", price: 266, cap: 3950, pe: 35.2, div: 0.4, vol: 0.25, group: "tech", aliases: ["Apple", "iPhone"] },
  { symbol: "MSFT", name: "Microsoft", exchange: "Nasdaq", currency: "USD", class: "stock", price: 508, cap: 3780, pe: 36.1, div: 0.7, vol: 0.24, group: "ai", aliases: ["Microsoft", "Azure"] },
  { symbol: "NVDA", name: "Nvidia", exchange: "Nasdaq", currency: "USD", class: "stock", price: 186, cap: 4530, pe: 49.5, div: 0.02, vol: 0.45, group: "ai", aliases: ["Nvidia"] },
  { symbol: "GOOGL", name: "Alphabet", exchange: "Nasdaq", currency: "USD", class: "stock", price: 281, cap: 3400, pe: 27.4, div: 0.3, vol: 0.28, group: "tech", aliases: ["Alphabet", "Google", "YouTube"] },
  { symbol: "META", name: "Meta Platforms", exchange: "Nasdaq", currency: "USD", class: "stock", price: 612, cap: 1540, pe: 26.3, div: 0.35, vol: 0.33, group: "tech", aliases: ["Meta Platforms", "Facebook", "Instagram", "WhatsApp"] },
  { symbol: "CAP.PA", name: "Capgemini", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 134.5, cap: 22.9, pe: 13.1, div: 2.6, vol: 0.28, group: "tech", aliases: ["Capgemini"] },
  { symbol: "STMPA.PA", name: "STMicroelectronics", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 21.3, cap: 19.2, pe: 25.4, div: 1.5, vol: 0.42, group: "tech", aliases: ["STMicroelectronics", "STMicro"] },
  { symbol: "ASML.AS", name: "ASML", exchange: "Euronext Amsterdam", currency: "EUR", class: "stock", price: 884, cap: 345, pe: 33.2, div: 0.8, vol: 0.36, group: "tech", aliases: ["ASML"] },
  { symbol: "SAP.DE", name: "SAP", exchange: "Xetra", currency: "EUR", class: "stock", price: 214, cap: 250, pe: 38.4, div: 1.1, vol: 0.27, group: "tech", aliases: ["SAP"] },
  { symbol: "DSY.PA", name: "Dassault Systèmes", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 27.4, cap: 36, pe: 30.2, div: 0.9, vol: 0.3, group: "tech", aliases: ["Dassault Systèmes"] },

  // ─── Quantique ───────────────────────────────────────────────────────────
  { symbol: "IONQ", name: "IonQ", exchange: "NYSE", currency: "USD", class: "stock", price: 48.2, cap: 16.1, pe: null, div: 0, vol: 0.95, group: "quantum", aliases: ["IonQ"] },
  { symbol: "RGTI", name: "Rigetti Computing", exchange: "Nasdaq", currency: "USD", class: "stock", price: 29.8, cap: 9.6, pe: null, div: 0, vol: 1.1, group: "quantum", aliases: ["Rigetti"] },
  { symbol: "QBTS", name: "D-Wave Quantum", exchange: "NYSE", currency: "USD", class: "stock", price: 25.1, cap: 8.4, pe: null, div: 0, vol: 1.1, group: "quantum", aliases: ["D-Wave"] },
  { symbol: "QUBT", name: "Quantum Computing Inc.", exchange: "Nasdaq", currency: "USD", class: "stock", price: 14.2, cap: 2.8, pe: null, div: 0, vol: 1.2, group: "quantum", aliases: ["Quantum Computing Inc"] },
  { symbol: "IBM", name: "IBM", exchange: "NYSE", currency: "USD", class: "stock", price: 301, cap: 280, pe: 35.1, div: 2.2, vol: 0.25, group: "tech", aliases: ["IBM", "IBM Quantum"] },
  { symbol: "HON", name: "Honeywell (Quantinuum)", exchange: "Nasdaq", currency: "USD", class: "stock", price: 199, cap: 127, pe: 22.3, div: 2.3, vol: 0.2, group: "industry", aliases: ["Honeywell"], description: "Actionnaire majoritaire de Quantinuum." },

  // ─── IA ──────────────────────────────────────────────────────────────────
  { symbol: "PLTR", name: "Palantir", exchange: "Nasdaq", currency: "USD", class: "stock", price: 176, cap: 416, pe: 390, div: 0, vol: 0.65, group: "ai", aliases: ["Palantir"] },
  { symbol: "AMD", name: "AMD", exchange: "Nasdaq", currency: "USD", class: "stock", price: 241, cap: 391, pe: 118, div: 0, vol: 0.5, group: "ai", aliases: ["AMD", "Advanced Micro Devices"] },
  { symbol: "AVGO", name: "Broadcom", exchange: "Nasdaq", currency: "USD", class: "stock", price: 342, cap: 1610, pe: 81, div: 0.7, vol: 0.42, group: "ai", aliases: ["Broadcom"] },
  { symbol: "TSM", name: "TSMC", exchange: "NYSE", currency: "USD", class: "stock", price: 291, cap: 1510, pe: 28.3, div: 1.2, vol: 0.36, group: "ai", aliases: ["TSMC", "Taiwan Semiconductor"] },

  // ─── Luxe ────────────────────────────────────────────────────────────────
  { symbol: "MC.PA", name: "LVMH", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 621, cap: 311, pe: 26.2, div: 2.1, vol: 0.27, group: "luxury", aliases: ["LVMH", "Louis Vuitton", "Dior", "Moët Hennessy", "Bernard Arnault"] },
  { symbol: "RMS.PA", name: "Hermès", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 2104, cap: 222, pe: 48.1, div: 0.8, vol: 0.24, group: "luxury", aliases: ["Hermès"] },
  { symbol: "KER.PA", name: "Kering", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 309, cap: 38, pe: 61, div: 1.3, vol: 0.38, group: "luxury", aliases: ["Kering", "Gucci", "Saint Laurent", "Bottega Veneta"] },
  { symbol: "CFR.SW", name: "Richemont", exchange: "SIX Swiss", currency: "CHF", class: "stock", price: 156, cap: 91, pe: 28.4, div: 1.9, vol: 0.29, group: "luxury", aliases: ["Richemont", "Cartier", "Van Cleef"] },
  { symbol: "1913.HK", name: "Prada", exchange: "Hong Kong", currency: "HKD", class: "stock", price: 45.3, cap: 116, pe: 20.1, div: 2.8, vol: 0.35, group: "luxury", aliases: ["Prada", "Miu Miu"] },
  { symbol: "MONC.MI", name: "Moncler", exchange: "Borsa Italiana", currency: "EUR", class: "stock", price: 52.4, cap: 14.2, pe: 22.6, div: 2.6, vol: 0.32, group: "luxury", aliases: ["Moncler"] },
  { symbol: "BRBY.L", name: "Burberry", exchange: "London", currency: "GBX", capCurrency: "GBP", class: "stock", price: 1148, cap: 4.1, pe: null, div: 0, vol: 0.45, group: "luxury", aliases: ["Burberry"] },

  // ─── Banques & Finance ───────────────────────────────────────────────────
  { symbol: "BNP.PA", name: "BNP Paribas", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 72.1, cap: 82, pe: 7.6, div: 6.5, vol: 0.27, group: "banks", aliases: ["BNP Paribas"] },
  { symbol: "GLE.PA", name: "Société Générale", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 55.4, cap: 43, pe: 9.1, div: 3.5, vol: 0.33, group: "banks", aliases: ["Société Générale", "SocGen"] },
  { symbol: "ACA.PA", name: "Crédit Agricole", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 16.2, cap: 49, pe: 8.2, div: 6.9, vol: 0.24, group: "banks", aliases: ["Crédit Agricole"] },
  { symbol: "JPM", name: "JPMorgan Chase", exchange: "NYSE", currency: "USD", class: "stock", price: 306, cap: 842, pe: 15.3, div: 1.9, vol: 0.22, group: "banks", aliases: ["JPMorgan", "Jamie Dimon"] },
  { symbol: "GS", name: "Goldman Sachs", exchange: "NYSE", currency: "USD", class: "stock", price: 792, cap: 241, pe: 16.4, div: 2.0, vol: 0.27, group: "banks", aliases: ["Goldman Sachs"] },
  { symbol: "BAC", name: "Bank of America", exchange: "NYSE", currency: "USD", class: "stock", price: 52.3, cap: 391, pe: 14.2, div: 2.1, vol: 0.25, group: "banks", aliases: ["Bank of America"] },
  { symbol: "HSBA.L", name: "HSBC", exchange: "London", currency: "GBX", capCurrency: "GBP", class: "stock", price: 1021, cap: 181, pe: 10.2, div: 5.1, vol: 0.22, group: "banks", aliases: ["HSBC"] },

  // ─── Énergie ─────────────────────────────────────────────────────────────
  { symbol: "TTE.PA", name: "TotalEnergies", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 55.2, cap: 122, pe: 9.1, div: 6.1, vol: 0.22, group: "oil", aliases: ["TotalEnergies", "Patrick Pouyanné"] },
  { symbol: "SHEL.L", name: "Shell", exchange: "London", currency: "GBX", capCurrency: "GBP", class: "stock", price: 2702, cap: 160, pe: 13.1, div: 4.0, vol: 0.22, group: "oil", aliases: ["Shell"] },
  { symbol: "XOM", name: "ExxonMobil", exchange: "NYSE", currency: "USD", class: "stock", price: 115.4, cap: 492, pe: 16.2, div: 3.5, vol: 0.22, group: "oil", aliases: ["ExxonMobil", "Exxon"] },
  { symbol: "CVX", name: "Chevron", exchange: "NYSE", currency: "USD", class: "stock", price: 155.2, cap: 311, pe: 19.4, div: 4.3, vol: 0.23, group: "oil", aliases: ["Chevron"] },
  { symbol: "ENGI.PA", name: "Engie", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 20.1, cap: 49, pe: 11.2, div: 7.0, vol: 0.2, group: "utilities", aliases: ["Engie"] },
  { symbol: "BP.L", name: "BP", exchange: "London", currency: "GBX", capCurrency: "GBP", class: "stock", price: 432, cap: 68, pe: 20.3, div: 5.5, vol: 0.26, group: "oil", aliases: ["BP"] },

  // ─── Énergies renouvelables ─────────────────────────────────────────────
  { symbol: "VWS.CO", name: "Vestas Wind Systems", exchange: "Copenhague", currency: "DKK", class: "stock", price: 141, cap: 142, pe: 35.4, div: 0.7, vol: 0.4, group: "green", aliases: ["Vestas"] },
  { symbol: "FSLR", name: "First Solar", exchange: "Nasdaq", currency: "USD", class: "stock", price: 251, cap: 27, pe: 20.2, div: 0, vol: 0.5, group: "green", aliases: ["First Solar"] },
  { symbol: "ENPH", name: "Enphase Energy", exchange: "Nasdaq", currency: "USD", class: "stock", price: 32.4, cap: 4.3, pe: 25.1, div: 0, vol: 0.65, group: "green", aliases: ["Enphase"] },
  { symbol: "ORSTED.CO", name: "Ørsted", exchange: "Copenhague", currency: "DKK", class: "stock", price: 121, cap: 51, pe: null, div: 0, vol: 0.5, group: "green", aliases: ["Ørsted", "Orsted"] },
  { symbol: "NEE", name: "NextEra Energy", exchange: "NYSE", currency: "USD", class: "stock", price: 82.4, cap: 170, pe: 26.2, div: 2.8, vol: 0.24, group: "utilities", aliases: ["NextEra"] },
  { symbol: "IBE.MC", name: "Iberdrola", exchange: "Madrid", currency: "EUR", class: "stock", price: 17.6, cap: 113, pe: 19.3, div: 3.6, vol: 0.18, group: "utilities", aliases: ["Iberdrola"] },

  // ─── Santé & Pharma ─────────────────────────────────────────────────────
  { symbol: "SAN.PA", name: "Sanofi", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 86.3, cap: 106, pe: 12.4, div: 4.6, vol: 0.2, group: "health", aliases: ["Sanofi"] },
  { symbol: "NOVO-B.CO", name: "Novo Nordisk", exchange: "Copenhague", currency: "DKK", class: "stock", price: 311, cap: 1380, pe: 13.2, div: 3.8, vol: 0.42, group: "health", aliases: ["Novo Nordisk", "Wegovy", "Ozempic"] },
  { symbol: "PFE", name: "Pfizer", exchange: "NYSE", currency: "USD", class: "stock", price: 25.2, cap: 143, pe: 13.4, div: 6.8, vol: 0.24, group: "health", aliases: ["Pfizer"] },
  { symbol: "LLY", name: "Eli Lilly", exchange: "NYSE", currency: "USD", class: "stock", price: 951, cap: 902, pe: 61.2, div: 0.6, vol: 0.33, group: "health", aliases: ["Eli Lilly", "Lilly", "Zepbound", "Mounjaro"] },
  { symbol: "AZN.L", name: "AstraZeneca", exchange: "London", currency: "GBX", capCurrency: "GBP", class: "stock", price: 13480, cap: 209, pe: 30.1, div: 2.0, vol: 0.22, group: "health", aliases: ["AstraZeneca"] },
  { symbol: "ROG.SW", name: "Roche", exchange: "SIX Swiss", currency: "CHF", class: "stock", price: 291, cap: 236, pe: 17.2, div: 3.4, vol: 0.2, group: "health", aliases: ["Roche"] },

  // ─── Automobile & VE ────────────────────────────────────────────────────
  { symbol: "TSLA", name: "Tesla", exchange: "Nasdaq", currency: "USD", class: "stock", price: 421, cap: 1400, pe: 228, div: 0, vol: 0.6, group: "auto", aliases: ["Tesla", "Elon Musk"] },
  { symbol: "STLAP.PA", name: "Stellantis", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 9.24, cap: 27, pe: 15.1, div: 7.0, vol: 0.38, group: "auto", aliases: ["Stellantis", "Peugeot", "Fiat", "Jeep"] },
  { symbol: "RNO.PA", name: "Renault", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 35.1, cap: 10.4, pe: 5.2, div: 6.1, vol: 0.36, group: "auto", aliases: ["Renault", "Dacia", "Ampere"] },
  { symbol: "1211.HK", name: "BYD", exchange: "Hong Kong", currency: "HKD", class: "stock", price: 101, cap: 1105, pe: 20.3, div: 1.4, vol: 0.45, group: "auto", aliases: ["BYD"] },
  { symbol: "VOW3.DE", name: "Volkswagen", exchange: "Xetra", currency: "EUR", class: "stock", price: 98.2, cap: 50, pe: 5.1, div: 6.4, vol: 0.3, group: "auto", aliases: ["Volkswagen"] },
  { symbol: "TM", name: "Toyota", exchange: "NYSE", currency: "USD", class: "stock", price: 196, cap: 256, pe: 9.2, div: 2.8, vol: 0.24, group: "auto", aliases: ["Toyota"] },
  { symbol: "RACE.MI", name: "Ferrari", exchange: "Borsa Italiana", currency: "EUR", class: "stock", price: 341, cap: 61, pe: 40.3, div: 0.9, vol: 0.27, group: "luxury", aliases: ["Ferrari"] },

  // ─── Aéronautique & Défense ─────────────────────────────────────────────
  { symbol: "AIR.PA", name: "Airbus", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 211, cap: 167, pe: 30.2, div: 1.0, vol: 0.27, group: "aero", aliases: ["Airbus"] },
  { symbol: "SAF.PA", name: "Safran", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 301, cap: 126, pe: 30.4, div: 1.0, vol: 0.26, group: "aero", aliases: ["Safran"] },
  { symbol: "HO.PA", name: "Thales", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 241, cap: 50, pe: 30.1, div: 1.6, vol: 0.3, group: "defense", aliases: ["Thales"] },
  { symbol: "AM.PA", name: "Dassault Aviation", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 281, cap: 22, pe: 22.4, div: 1.2, vol: 0.3, group: "defense", aliases: ["Dassault Aviation", "Rafale", "Falcon"] },
  { symbol: "LMT", name: "Lockheed Martin", exchange: "NYSE", currency: "USD", class: "stock", price: 482, cap: 112, pe: 23.1, div: 2.8, vol: 0.22, group: "defense", aliases: ["Lockheed Martin", "F-35"] },
  { symbol: "RHM.DE", name: "Rheinmetall", exchange: "Xetra", currency: "EUR", class: "stock", price: 1702, cap: 78, pe: 70.2, div: 0.6, vol: 0.45, group: "defense", aliases: ["Rheinmetall"] },
  { symbol: "BA", name: "Boeing", exchange: "NYSE", currency: "USD", class: "stock", price: 206, cap: 156, pe: null, div: 0, vol: 0.33, group: "aero", aliases: ["Boeing"] },
  { symbol: "RTX", name: "RTX", exchange: "NYSE", currency: "USD", class: "stock", price: 171, cap: 229, pe: 35.2, div: 1.6, vol: 0.22, group: "defense", aliases: ["RTX", "Raytheon", "Pratt & Whitney"] },

  // ─── Consommation & Distribution ────────────────────────────────────────
  { symbol: "OR.PA", name: "L'Oréal", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 371, cap: 198, pe: 30.3, div: 1.9, vol: 0.22, group: "consumer", aliases: ["L'Oréal", "Lancôme"] },
  { symbol: "BN.PA", name: "Danone", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 75.3, cap: 48, pe: 21.2, div: 2.9, vol: 0.17, group: "consumer", aliases: ["Danone"] },
  { symbol: "CA.PA", name: "Carrefour", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 13.1, cap: 9.1, pe: 12.1, div: 7.0, vol: 0.24, group: "consumer", aliases: ["Carrefour"] },
  { symbol: "AMZN", name: "Amazon", exchange: "Nasdaq", currency: "USD", class: "stock", price: 236, cap: 2510, pe: 33.4, div: 0, vol: 0.32, group: "tech", aliases: ["Amazon", "AWS"] },
  { symbol: "WMT", name: "Walmart", exchange: "Nasdaq", currency: "USD", class: "stock", price: 103, cap: 826, pe: 39.1, div: 0.9, vol: 0.2, group: "consumer", aliases: ["Walmart"] },
  { symbol: "NESN.SW", name: "Nestlé", exchange: "SIX Swiss", currency: "CHF", class: "stock", price: 80.4, cap: 207, pe: 18.2, div: 3.9, vol: 0.17, group: "consumer", aliases: ["Nestlé", "Nespresso"] },
  { symbol: "RI.PA", name: "Pernod Ricard", exchange: "Euronext Paris", currency: "EUR", class: "stock", price: 88.2, cap: 22, pe: 14.2, div: 5.3, vol: 0.27, group: "consumer", aliases: ["Pernod Ricard"] },
];

const BY_SYMBOL = new Map(INSTRUMENTS.map((i) => [i.symbol, i]));

export function getInstrument(symbol: string): Instrument | undefined {
  return BY_SYMBOL.get(symbol);
}

/** Instruments affichés dans le bandeau défilant de la page d'accueil */
export const TAPE_SYMBOLS = ["FCHI", "GDAXI", "GSPC", "IXIC", "DJI", "N225", "EURUSD", "XAU", "BRENT", "BTC-USD"];

/** Taux de conversion approximatifs vers l'EUR, utilisés pour pondérer les capitalisations. */
export const FX_TO_EUR: Record<string, number> = {
  EUR: 1, USD: 0.86, GBP: 1.15, GBX: 0.0115, CHF: 1.07, HKD: 0.11, DKK: 0.134, JPY: 0.0056, CNY: 0.12,
};
