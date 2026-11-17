/**
 * Générateur d'articles FICTIFS (mode démo). Les articles sont produits sur une grille
 * temporelle fixe : de nouveaux titres « tombent » au fil du temps, et certains sont
 * repris par plusieurs sources pour illustrer la fusion des doublons.
 * Ils passent ensuite par le même classifieur que les vrais articles.
 */
import { getCategory } from "@/config/categories";
import { getInstrument } from "@/config/instruments";
import { SOURCE_HOMEPAGES } from "@/config/feeds";
import { mulberry32, hashString, pick } from "@/lib/random";
import { fmtNumber } from "@/lib/format";
import type { Article } from "@/lib/types";

type Ctx = { n: string; n2: string; p: string; p2: string; b: string; r: () => number };
type Tpl = [title: (c: Ctx) => string, summary: (c: Ctx) => string];

const T: Record<string, Tpl[]> = {
  tech: [
    [(c) => `${c.n} dépasse les attentes au troisième trimestre grâce au cloud`, (c) => `Le chiffre d'affaires progresse de ${c.p} % sur un an, au-dessus du consensus. La direction relève prudemment ses prévisions annuelles.`],
    [(c) => `Semi-conducteurs : ${c.n} annonce ${c.b} milliards d'investissements`, () => `Le groupe veut augmenter ses capacités de production de puces avancées d'ici 2028, sur fond de demande soutenue.`],
    [() => `Les valeurs technologiques reculent avant les chiffres de l'inflation américaine`, (c) => `Le Nasdaq cède ${c.p2} % en séance, les investisseurs prenant leurs bénéfices sur les grandes capitalisations du secteur.`],
    [(c) => `${c.n} : un analyste relève son objectif de cours et reste à l'achat`, (c) => `Le bureau d'études estime que le potentiel de hausse atteint ${c.p} %, porté par les logiciels et les services.`],
    [(c) => `Cybersécurité : ${c.n} rachète une start-up européenne`, () => `Le montant de l'opération n'a pas été dévoilé. L'acquisition doit renforcer l'offre de logiciels de sécurité pour les entreprises.`],
  ],
  quantique: [
    [(c) => `${c.n} franchit un nouveau cap avec un processeur de 200 qubits`, () => `La société revendique une réduction significative du taux d'erreur, étape clé vers un ordinateur quantique tolérant aux fautes.`],
    [(c) => `Informatique quantique : ${c.n} signe un contrat avec le département américain de l'Énergie`, () => `Le contrat pluriannuel est estimé à plusieurs centaines de millions de dollars. Le titre bondit en préséance.`],
    [() => `Pasqal et Quantinuum accélèrent, les valeurs quantiques s'envolent à Wall Street`, (c) => `Les titres du secteur gagnent jusqu'à ${c.p} % après une série d'annonces techniques et de levées de fonds.`],
    [(c) => `${c.n} lève des fonds pour financer sa feuille de route quantique`, () => `L'augmentation de capital dilue les actionnaires existants mais allonge la visibilité financière de plusieurs années.`],
    [() => `Cryptographie post-quantique : l'Europe publie ses recommandations`, () => `Les régulateurs invitent banques et opérateurs à préparer la migration vers des algorithmes résistants aux ordinateurs quantiques.`],
  ],
  ia: [
    [(c) => `${c.n} : la demande en GPU pour l'IA reste « exceptionnelle »`, (c) => `Le groupe anticipe une croissance de ${c.p} % de ses revenus liés aux centres de données au prochain trimestre.`],
    [(c) => `IA générative : ${c.n} dévoile un nouveau modèle de langage pour les entreprises`, () => `Le modèle sera intégré à l'offre cloud du groupe dès le début de l'année prochaine.`],
    [(c) => `Data centers : ${c.n} et ${c.n2} s'associent dans un projet à ${c.b} milliards`, () => `Le partenariat prévoit la construction de plusieurs campus dédiés à l'intelligence artificielle aux États-Unis et en Europe.`],
    [() => `OpenAI négocie une nouvelle levée de fonds, valorisation record en vue`, () => `Les discussions porteraient sur plusieurs dizaines de milliards de dollars ; Microsoft resterait l'un des principaux partenaires.`],
    [(c) => `${c.n} recule : des doutes sur la rentabilité des investissements dans l'IA`, (c) => `Le titre perd ${c.p2} % ; certains gérants s'inquiètent de l'ampleur des dépenses d'investissement du secteur.`],
  ],
  luxe: [
    [(c) => `${c.n} : ventes trimestrielles en hausse de ${c.p} % en organique`, () => `La maroquinerie reste le moteur de la croissance, tandis que la clientèle chinoise montre des signes de reprise.`],
    [() => `Le luxe pénalisé par le ralentissement en Chine`, (c) => `Les grandes maisons reculent en Bourse, ${c.n} et ${c.n2} en tête, après des chiffres de consommation décevants en Asie.`],
    [(c) => `${c.n} relève ses prix en maroquinerie et en joaillerie`, (c) => `Une hausse moyenne d'environ ${c.p2} % est attendue, selon des sources proches du groupe.`],
    [(c) => `Haute couture : ${c.n} nomme un nouveau directeur artistique`, () => `Le marché salue la nomination, attendue pour relancer la désirabilité de la maison.`],
    [(c) => `Horlogerie : ${c.n} affiche une demande solide aux États-Unis`, () => `Les exportations de montres suisses vers les États-Unis compensent la faiblesse du marché asiatique.`],
  ],
  banques: [
    [(c) => `${c.n} bat le consensus grâce à la banque d'investissement`, (c) => `Le produit net bancaire progresse de ${c.p} % ; le groupe annonce un nouveau programme de rachat d'actions.`],
    [(c) => `${c.n} relève son objectif de rentabilité pour 2027`, () => `La banque vise un retour sur fonds propres tangibles en nette amélioration, porté par la baisse du coût du risque.`],
    [() => `Les banques européennes profitent de la remontée des taux longs`, (c) => `L'indice sectoriel gagne ${c.p2} % ; la marge nette d'intérêt devrait rester solide en 2027.`],
    [(c) => `Fusions-acquisitions : ${c.n} conseille une opération à ${c.b} milliards`, () => `L'activité de conseil bénéficie du retour des grandes transactions transatlantiques.`],
    [() => `Bâle III : les banques obtiennent un report partiel des nouvelles règles`, () => `Le compromis réglementaire allège les exigences en capital sur les activités de marché.`],
  ],
  energie: [
    [() => `Le pétrole recule, l'OPEP+ envisage d'augmenter sa production`, (c) => `Le Brent perd ${c.p2} % ; les majors pétrolières cèdent du terrain en Bourse.`],
    [(c) => `${c.n} confirme son dividende et son programme de rachats`, (c) => `Le groupe maintient un retour à l'actionnaire de ${c.b} milliards malgré la baisse du prix du baril.`],
    [(c) => `GNL : ${c.n} signe un contrat d'approvisionnement de long terme`, () => `L'accord porte sur 20 ans et sécurise des débouchés en Asie pour le gaz naturel liquéfié.`],
    [(c) => `${c.n} : la production d'hydrocarbures atteint un record`, (c) => `La production progresse de ${c.p} % sur un an grâce à la mise en service de nouveaux champs.`],
    [(c) => `Raffinage : les marges se tendent, ${c.n} en profite`, () => `Les marges de raffinage européennes atteignent leur plus haut niveau depuis plusieurs mois.`],
  ],
  renouvelables: [
    [(c) => `Éolien en mer : ${c.n} remporte un appel d'offres géant`, () => `Le projet de plus de 1 GW doit entrer en service d'ici la fin de la décennie.`],
    [(c) => `Solaire : ${c.n} relève ses prévisions grâce aux crédits d'impôt américains`, (c) => `Le carnet de commandes de panneaux solaires progresse de ${c.p} % sur un an.`],
    [() => `Les valeurs des énergies renouvelables rebondissent avec la détente des taux`, (c) => `${c.n} et ${c.n2} figurent parmi les plus fortes hausses du jour.`],
    [(c) => `${c.n} : prises de commandes record pour ses éoliennes`, () => `Les commandes du trimestre dépassent les attentes, notamment en Europe du Nord.`],
    [(c) => `Transition énergétique : ${c.n} cède des actifs pour réduire sa dette`, (c) => `Les cessions pourraient rapporter ${c.b} milliards et renforcer le bilan.`],
  ],
  sante: [
    [(c) => `${c.n} : résultats positifs pour son traitement contre l'obésité`, (c) => `L'essai clinique de phase 3 montre une perte de poids moyenne de ${c.p} %. Le titre bondit.`],
    [(c) => `La FDA approuve un nouveau médicament de ${c.n} en oncologie`, () => `L'autorisation ouvre un marché estimé à plusieurs milliards de dollars par an.`],
    [(c) => `GLP-1 : la concurrence s'intensifie entre ${c.n} et ${c.n2}`, () => `Les deux laboratoires multiplient les baisses de prix et les nouvelles formulations orales.`],
    [(c) => `${c.n} relève sa prévision de bénéfice annuel`, (c) => `Le laboratoire pharmaceutique table désormais sur une croissance du BPA de ${c.p} % à taux de change constants.`],
    [(c) => `Vaccins : ${c.n} subit un revers réglementaire en Europe`, () => `L'EMA demande des données complémentaires avant de se prononcer.`],
  ],
  auto: [
    [(c) => `${c.n} : livraisons de véhicules électriques en hausse de ${c.p} %`, () => `Le constructeur bénéficie du succès de ses nouveaux modèles d'entrée de gamme.`],
    [() => `Immatriculations en Europe : le marché automobile progresse`, (c) => `Les véhicules électriques représentent désormais une part record des ventes ; ${c.n} gagne des parts de marché.`],
    [(c) => `Robotaxi : ${c.n} élargit ses essais à de nouvelles villes`, () => `Le service de conduite autonome doit être lancé commercialement l'an prochain.`],
    [(c) => `${c.n} abaisse sa marge opérationnelle, le titre chute`, (c) => `Le constructeur automobile évoque une concurrence accrue et des prix en baisse ; l'action perd ${c.p2} %.`],
    [(c) => `Batteries : ${c.n} et ${c.n2} s'allient pour une usine en Europe`, (c) => `L'investissement de ${c.b} milliards d'euros doit créer plusieurs milliers d'emplois.`],
  ],
  "aero-defense": [
    [(c) => `${c.n} : livraisons d'avions conformes aux objectifs`, () => `L'avionneur confirme sa cible annuelle malgré les tensions persistantes sur la chaîne d'approvisionnement.`],
    [(c) => `Défense : ${c.n} décroche une commande de ${c.b} milliards`, () => `Le contrat renforce encore un carnet de commandes déjà au plus haut historique.`],
    [() => `L'OTAN appelle à accélérer les dépenses militaires, les valeurs de défense montent`, (c) => `${c.n} et ${c.n2} progressent de plus de ${c.p2} % en séance.`],
    [(c) => `Moteurs : ${c.n} relève ses objectifs dans l'après-vente`, (c) => `Les activités de maintenance progressent de ${c.p} %, portées par le trafic aérien.`],
    [(c) => `Spatial : ${c.n} remporte un contrat de satellites`, () => `Le programme porte sur une constellation de satellites de télécommunications.`],
  ],
  conso: [
    [(c) => `${c.n} : croissance organique de ${c.p} %, tirée par les cosmétiques`, () => `Les ventes en Europe et aux États-Unis compensent un marché chinois toujours atone.`],
    [() => `Black Friday : la grande distribution s'attend à des ventes record en ligne`, (c) => `Le commerce en ligne devrait progresser de ${c.p} % ; ${c.n} est en première ligne.`],
    [(c) => `${c.n} cède des magasins pour se recentrer sur ses marchés clés`, () => `Le distributeur poursuit la simplification de son portefeuille.`],
    [(c) => `Agroalimentaire : ${c.n} augmente ses prix de vente`, (c) => `Une hausse moyenne de ${c.p2} % est prévue pour compenser le coût des matières premières.`],
    [(c) => `Spiritueux : ${c.n} pénalisé par la baisse de la consommation`, () => `Les volumes reculent aux États-Unis et en Chine, le groupe réduit ses coûts.`],
  ],
  crypto: [
    [() => `Le bitcoin repasse au-dessus de 90 000 dollars`, () => `Les flux vers les ETF bitcoin au comptant se redressent, soutenant l'ensemble des cryptomonnaies.`],
    [() => `Ethereum : la mise à jour du réseau est un succès`, (c) => `L'ether gagne ${c.p2} % ; les frais de transaction reculent sensiblement.`],
    [(c) => `${c.n} : volumes de transactions en hausse de ${c.p} %`, () => `La plateforme d'échange de cryptoactifs profite du regain d'intérêt des investisseurs particuliers.`],
    [() => `MiCA : les premiers agréments européens délivrés aux plateformes crypto`, () => `Le règlement européen encadre désormais l'émission de stablecoins et les prestataires de services.`],
    [(c) => `MicroStrategy achète de nouveaux bitcoins pour ${c.b} milliards de dollars`, () => `La société porte sa trésorerie en bitcoin à un nouveau record.`],
  ],
  "matieres-premieres": [
    [() => `Le cours de l'or atteint un nouveau record, à plus de 4 000 dollars l'once`, () => `Le métal jaune profite des achats des banques centrales et de la baisse des taux réels.`],
    [() => `Le cuivre grimpe sur fond de tensions d'approvisionnement`, (c) => `Le métal rouge gagne ${c.p2} % ; plusieurs mines sud-américaines réduisent leur production.`],
    [() => `Lithium : les prix se stabilisent après deux ans de baisse`, () => `Les producteurs chinois réduisent l'offre, ce qui soutient les cours du lithium.`],
    [() => `Pétrole : le baril de Brent recule sur des craintes de surabondance`, (c) => `Les stocks américains progressent plus que prévu ; le Brent perd ${c.p2} %.`],
    [() => `Métaux précieux : l'argent surperforme l'or`, (c) => `Le cours de l'argent progresse de ${c.p} % depuis le début du mois, porté par la demande industrielle.`],
  ],
  macro: [
    [() => `BCE : Christine Lagarde se veut prudente sur de nouvelles baisses de taux`, () => `La présidente de la banque centrale juge l'inflation proche de la cible mais appelle à la vigilance.`],
    [() => `Fed : Jerome Powell n'exclut pas une pause dans l'assouplissement`, () => `Le président de la Réserve fédérale souligne la solidité du marché de l'emploi américain.`],
    [(c) => `Inflation : la zone euro à ${c.p2} % sur un an`, () => `L'inflation sous-jacente se stabilise, confortant le scénario d'une BCE en attente.`],
    [() => `Emploi américain : créations de postes supérieures aux attentes`, () => `Le taux de chômage reste stable ; les taux obligataires remontent dans la foulée.`],
    [() => `France : l'Insee confirme une croissance modeste du PIB`, () => `La consommation des ménages soutient l'activité, l'investissement reste en retrait.`],
    [() => `OAT : l'écart de taux avec le Bund se resserre`, () => `Le marché obligataire salue l'adoption du budget ; le rendement de l'OAT à 10 ans recule.`],
  ],
};

const SOURCES = Object.keys(SOURCE_HOMEPAGES);
const SLOT_MS = 13 * 60_000;
const WINDOW_MS = 48 * 3600_000;
const CATS = Object.keys(T);

function stocksOf(slug: string): string[] {
  const c = getCategory(slug);
  const names = (c?.symbols ?? [])
    .map((s) => getInstrument(s))
    .filter((i) => i && (i.class === "stock" || i.class === "crypto"))
    .map((i) => i!.name.replace(/ \(.*\)$/, ""));
  return names.length ? names : ["Le groupe"];
}

export function mockArticles(now = Date.now()): Article[] {
  const out: Article[] = [];
  const last = Math.floor(now / SLOT_MS);
  const first = Math.floor((now - WINDOW_MS) / SLOT_MS);
  const seen = new Set<string>();
  for (let k = last; k >= first; k--) {
    const r = mulberry32(hashString(`news:${k}`));
    const cat = CATS[Math.floor(r() * CATS.length)];
    const tpl = pick(T[cat], r);
    const names = stocksOf(cat);
    const n = pick(names, r);
    const others = names.filter((x) => x !== n);
    const ctx: Ctx = {
      n,
      n2: others.length ? pick(others, r) : n,
      p: fmtNumber(2 + r() * 18, 1),
      p2: fmtNumber(0.5 + r() * 3.5, 1),
      b: String(2 + Math.floor(r() * 8)),
      r,
    };
    const title = tpl[0](ctx);
    if (seen.has(title)) continue;
    seen.add(title);
    const summary = tpl[1](ctx);
    const t = k * SLOT_MS + Math.floor(r() * 8) * 60_000;
    if (t > now) continue;
    const source = pick(SOURCES, r);
    out.push(make(k, 0, title, summary, source, t));
    // ~1 article sur 4 est repris par d'autres sources (doublons fusionnés ensuite)
    if (r() < 0.25) {
      const copies = 1 + Math.floor(r() * 2);
      for (let j = 1; j <= copies; j++) {
        const s2 = SOURCES[(SOURCES.indexOf(source) + j * 2) % SOURCES.length];
        const t2 = t + j * (5 + Math.floor(r() * 30)) * 60_000;
        if (t2 > now) continue;
        out.push(make(k, j, j === 1 ? title : title.replace(" : ", ", "), summary, s2, t2));
      }
    }
  }
  return out;
}

function make(k: number, j: number, title: string, summary: string, source: string, t: number): Article {
  const url = `${SOURCE_HOMEPAGES[source]}#demo-${k}-${j}`;
  return { id: `demo-${k}-${j}`, title, summary, url, source, sources: [], publishedAt: t, categories: [], symbols: [], demo: true };
}
