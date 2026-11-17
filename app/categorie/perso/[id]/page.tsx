"use client";
import Link from "next/link";
import { use } from "react";
import { useCustomCategories } from "@/lib/store";
import { CategoryView } from "@/components/CategoryView";

export default function CustomCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { custom } = useCustomCategories();
  const def = custom.find((c) => c.slug === id);
  if (!def) {
    return (
      <div className="card p-6 text-center">
        <p className="mb-3">Cette catégorie personnalisée n&apos;existe pas (ou a été créée sur un autre navigateur).</p>
        <Link href="/mes-categories" className="text-brand underline">Gérer mes catégories</Link>
      </div>
    );
  }
  return (
    <CategoryView
      def={def}
      actions={<Link href={`/mes-categories?edit=${def.slug}`} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm hover:bg-surface2">✏️ Modifier</Link>}
    />
  );
}
