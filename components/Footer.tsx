export function Footer({ mode }: { mode: "demo" | "live" }) {
  return (
    <footer className="mt-10 border-t border-line bg-surface px-4 py-6 text-xs leading-relaxed text-muted">
      <div className="mx-auto max-w-[1600px] space-y-2">
        <p>
          <strong className="text-fg">Mentions légales.</strong> Les informations publiées sur MarketPulse sont fournies à titre purement informatif et
          ne constituent en aucun cas un conseil en investissement, une recommandation personnalisée ni une sollicitation d&apos;achat ou de vente
          d&apos;instruments financiers. Les cours peuvent être différés (jusqu&apos;à 15 minutes ou davantage selon les places et les fournisseurs) et
          peuvent comporter des erreurs. Investir comporte un risque de perte en capital. Les actualités appartiennent à leurs éditeurs respectifs.
        </p>
        {mode === "demo" && (
          <p className="text-amber-600 dark:text-amber-400">
            Mode démonstration : les cours, actualités et événements affichés sont FICTIFS et générés automatiquement.
          </p>
        )}
        <p>Heures affichées : heure de Paris. © {new Date().getFullYear()} MarketPulse.</p>
      </div>
    </footer>
  );
}
