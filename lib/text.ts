/** Normalisation : minuscules, sans accents, ponctuation → espaces. */
export function normalize(s: string): string {
  return ` ${s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’'`]/g, " ")
    .replace(/[^a-z0-9&+\-\.]+/g, " ")
    .replace(/(\s)[\-\.]+|[\-\.]+(\s)/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

/** Vrai si `phrase` (déjà normalisée, sans espaces de bord) apparaît en mots entiers dans `text` normalisé. */
export function containsPhrase(normText: string, normPhrase: string): boolean {
  return normText.includes(` ${normPhrase} `);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}
