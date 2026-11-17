import type { ApiError } from "@/lib/types";

export function ErrorNotice({ errors, className = "" }: { errors?: ApiError[]; className?: string }) {
  if (!errors?.length) return null;
  return (
    <details className={`rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300 ${className}`}>
      <summary className="cursor-pointer">
        ⚠️ {errors.length} source{errors.length > 1 ? "s" : ""} momentanément indisponible{errors.length > 1 ? "s" : ""} — les autres données restent à jour.
      </summary>
      <ul className="mt-1 list-disc pl-5">
        {errors.map((e, i) => (
          <li key={i}><strong>{e.source}</strong> : {e.message}</li>
        ))}
      </ul>
    </details>
  );
}
