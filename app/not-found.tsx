import Link from "next/link";
export default function NotFound() {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <p className="text-4xl">📉</p>
      <h1 className="mt-2 text-xl font-bold">Page introuvable</h1>
      <p className="mt-1 text-muted">Ce secteur ou cette valeur n&apos;existe pas.</p>
      <Link href="/" className="mt-4 inline-block text-brand underline">Retour à l&apos;accueil</Link>
    </div>
  );
}
