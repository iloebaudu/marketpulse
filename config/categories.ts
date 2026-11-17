/**
 * ════════════════════════════════════════════════════════════════════════════
 *  RÈGLES DE CLASSEMENT — catégories, valeurs suivies et mots-clés
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Un article est rattaché à une catégorie si :
 *   1. il mentionne une valeur listée dans `symbols` (via son nom, ses `aliases`
 *      définis dans config/instruments.ts, ou son ticker en majuscules, ex. « NVDA ») ;
 *   2. OU il contient l'un des `keywords`.
 *
 * La comparaison ignore la casse, les accents et la ponctuation, et se fait sur
 * des mots entiers (« ia » ne matche pas « via »).
 *
 * Une même valeur peut figurer dans plusieurs catégories (ex. NVDA : Tech + IA).
 *
 * Pour ajouter une catégorie : copiez un bloc, choisissez un `slug` unique
 * (utilisé dans l'URL /categorie/<slug>), une icône, une couleur et vos règles.
 */
import type { CategoryDef } from "@/lib/types";

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "tech",
    name: "Tech",
    shortName: "Tech",
    icon: "💻",
    color: "#3b82f6",
    description: "Géants du numérique, logiciels et semi-conducteurs.",
    symbols: ["AAPL", "MSFT", "NVDA", "GOOGL", "META", "AMZN", "ASML.AS", "SAP.DE", "CAP.PA", "STMPA.PA", "DSY.PA", "IBM"],
    keywords: ["technologie", "technologique", "technologiques", "valeurs technologiques", "logiciel", "logiciels", "semi-conducteur", "semi-conducteurs", "puces", "cloud", "smartphone", "cybersécurité", "big tech", "numérique", "Nasdaq"],
  },
  {
    slug: "quantique",
    name: "Quantique",
    shortName: "Quantique",
    icon: "⚛️",
    color: "#a855f7",
    description: "Informatique quantique : matériel, logiciels et cryptographie post-quantique.",
    symbols: ["IONQ", "RGTI", "QBTS", "QUBT", "IBM", "HON", "GOOGL"],
    keywords: ["quantique", "qubit", "qubits", "informatique quantique", "ordinateur quantique", "ordinateurs quantiques", "post-quantique", "Quantinuum", "Pasqal", "Alice & Bob", "Quandela", "correction d'erreurs quantiques"],
  },
  {
    slug: "ia",
    name: "Intelligence artificielle",
    shortName: "IA",
    icon: "🤖",
    color: "#06b6d4",
    description: "Puces, cloud et logiciels de l'intelligence artificielle.",
    symbols: ["NVDA", "MSFT", "PLTR", "AMD", "AVGO", "TSM", "GOOGL", "META"],
    keywords: ["intelligence artificielle", "IA", "IA générative", "OpenAI", "ChatGPT", "Anthropic", "Mistral AI", "LLM", "modèle de langage", "modèles de langage", "GPU", "data center", "data centers", "centre de données", "centres de données", "machine learning"],
  },
  {
    slug: "luxe",
    name: "Luxe",
    shortName: "Luxe",
    icon: "👜",
    color: "#c8a24a",
    description: "Maisons de luxe, mode, maroquinerie, joaillerie et horlogerie.",
    symbols: ["MC.PA", "RMS.PA", "KER.PA", "CFR.SW", "1913.HK", "MONC.MI", "BRBY.L", "RACE.MI"],
    keywords: ["luxe", "maroquinerie", "haute couture", "joaillerie", "horlogerie", "prêt-à-porter", "maisons de luxe", "défilé", "clientèle chinoise", "Chanel"],
  },
  {
    slug: "banques",
    name: "Banques & Finance",
    shortName: "Banques",
    icon: "🏦",
    color: "#6366f1",
    description: "Banques, assureurs et services financiers.",
    symbols: ["BNP.PA", "GLE.PA", "ACA.PA", "JPM", "GS", "BAC", "HSBA.L"],
    keywords: ["banque", "banques", "bancaire", "bancaires", "établissements financiers", "marge nette d'intérêt", "Bâle III", "banque d'investissement", "assureur", "assureurs", "fusions-acquisitions", "rachat d'actions"],
  },
  {
    slug: "energie",
    name: "Énergie",
    shortName: "Énergie",
    icon: "⚡",
    color: "#f97316",
    description: "Majors pétrolières et gazières, utilities.",
    symbols: ["TTE.PA", "SHEL.L", "XOM", "CVX", "BP.L", "ENGI.PA"],
    keywords: ["pétrole", "pétrolier", "pétrolière", "pétrolières", "gaz", "GNL", "gaz naturel", "OPEP", "OPEP+", "raffinage", "baril", "majors"],
  },
  {
    slug: "renouvelables",
    name: "Énergies renouvelables",
    shortName: "Renouvelables",
    icon: "🌱",
    color: "#84cc16",
    description: "Éolien, solaire, stockage et hydrogène.",
    symbols: ["VWS.CO", "FSLR", "ENPH", "ORSTED.CO", "NEE", "IBE.MC"],
    keywords: ["renouvelable", "renouvelables", "solaire", "photovoltaïque", "éolien", "éolienne", "éoliennes", "éolien en mer", "hydrogène vert", "transition énergétique", "panneaux solaires", "Neoen"],
  },
  {
    slug: "sante",
    name: "Santé & Pharma",
    shortName: "Santé",
    icon: "💊",
    color: "#ec4899",
    description: "Laboratoires pharmaceutiques, biotechs et medtechs.",
    symbols: ["SAN.PA", "NOVO-B.CO", "PFE", "LLY", "AZN.L", "ROG.SW"],
    keywords: ["pharma", "pharmaceutique", "pharmaceutiques", "laboratoire", "médicament", "médicaments", "vaccin", "essai clinique", "essais cliniques", "FDA", "EMA", "obésité", "GLP-1", "biotech", "biotechs", "oncologie"],
  },
  {
    slug: "auto",
    name: "Automobile & VE",
    shortName: "Auto",
    icon: "🚗",
    color: "#14b8a6",
    description: "Constructeurs automobiles et véhicules électriques.",
    symbols: ["TSLA", "STLAP.PA", "RNO.PA", "1211.HK", "VOW3.DE", "TM", "RACE.MI"],
    keywords: ["automobile", "automobiles", "constructeur automobile", "constructeurs automobiles", "véhicule électrique", "véhicules électriques", "voitures électriques", "immatriculations", "robotaxi", "batteries"],
  },
  {
    slug: "aero-defense",
    name: "Aéronautique & Défense",
    shortName: "Aéro & Défense",
    icon: "✈️",
    color: "#94a3b8",
    description: "Avionneurs, motoristes, équipementiers et industrie de défense.",
    symbols: ["AIR.PA", "SAF.PA", "HO.PA", "AM.PA", "LMT", "RHM.DE", "BA", "RTX"],
    keywords: ["aéronautique", "défense", "avionneur", "livraisons d'avions", "moyen-courrier", "motoriste", "armement", "OTAN", "spatial", "missiles", "dépenses militaires"],
  },
  {
    slug: "conso",
    name: "Consommation & Distribution",
    shortName: "Conso",
    icon: "🛒",
    color: "#f59e0b",
    description: "Biens de consommation, cosmétiques, agroalimentaire et distribution.",
    symbols: ["OR.PA", "BN.PA", "CA.PA", "AMZN", "WMT", "NESN.SW", "RI.PA"],
    keywords: ["consommation", "consommateurs", "distribution", "grande distribution", "distributeur", "cosmétiques", "e-commerce", "commerce en ligne", "ventes au détail", "Black Friday", "agroalimentaire", "spiritueux"],
  },
  {
    slug: "crypto",
    name: "Cryptomonnaies",
    shortName: "Crypto",
    icon: "🪙",
    color: "#eab308",
    description: "Bitcoin, Ethereum, altcoins et sociétés exposées aux cryptoactifs.",
    symbols: ["BTC-USD", "ETH-USD", "SOL-USD", "COIN", "MSTR"],
    keywords: ["crypto", "cryptos", "cryptomonnaie", "cryptomonnaies", "cryptoactifs", "blockchain", "stablecoin", "stablecoins", "ETF bitcoin", "MiCA", "minage"],
  },
  {
    slug: "matieres-premieres",
    name: "Matières premières",
    shortName: "Matières premières",
    icon: "🛢️",
    color: "#b45309",
    description: "Métaux précieux, pétrole, métaux industriels et lithium.",
    symbols: ["XAU", "XAG", "BRENT", "WTI", "NATGAS", "COPPER", "LITHIUM"],
    keywords: ["matières premières", "métaux", "métaux précieux", "métaux industriels", "baril", "once", "cuivre", "lithium", "nickel", "minerai", "minier", "minières"],
  },
  {
    slug: "macro",
    name: "Macroéconomie & Banques centrales",
    shortName: "Macro",
    icon: "🏛️",
    color: "#0ea5e9",
    description: "BCE, Fed, inflation, taux, emploi et croissance.",
    symbols: ["US10Y", "DE10Y", "FR10Y", "EURUSD", "DXY", "VIX", "GSPC", "FCHI"],
    keywords: ["BCE", "Fed", "Réserve fédérale", "banque centrale", "banques centrales", "taux directeur", "taux directeurs", "inflation", "chômage", "emploi", "PIB", "croissance économique", "récession", "Christine Lagarde", "Jerome Powell", "FOMC", "obligataire", "OAT", "Bund", "Insee"],
  },
];

const BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function getCategory(slug: string): CategoryDef | undefined {
  return BY_SLUG.get(slug);
}

/** Catégories contenant une valeur donnée */
export function categoriesForSymbol(symbol: string): CategoryDef[] {
  return CATEGORIES.filter((c) => c.symbols.includes(symbol));
}
