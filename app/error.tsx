"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <p className="text-4xl">⚠️</p>
      <h1 className="mt-2 text-xl font-bold">Une erreur est survenue</h1>
      <p className="mt-1 text-muted">Une source de données est peut-être momentanément indisponible.</p>
      <button onClick={reset} className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Réessayer</button>
    </div>
  );
}
