export function Sparkline({ data, width = 96, height = 28, className = "" }: { data: number[]; width?: number; height?: number; className?: string }) {
  if (!data || data.length < 2) return <span className="text-muted text-xs">—</span>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * width, height - 2 - ((v - min) / span) * (height - 4)]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  const up = data[data.length - 1] >= data[0];
  const color = up ? "rgb(var(--up))" : "rgb(var(--down))";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden>
      <path d={`${d}L${width},${height}L0,${height}Z`} fill={color} opacity={0.1} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}
