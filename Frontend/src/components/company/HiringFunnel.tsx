interface HiringFunnelProps {
  title: string;
  counts: Record<string, number>;
  total: number;
}

// Your JobDetail.tsx dashboard tab currently renders funnel stages as plain
// stat cards (grid of numbers). This is a bar-chart alternative — no chart
// library needed, dependency-free — available if you want a more visual
// funnel view later.
export default function HiringFunnel({ title, counts, total }: HiringFunnelProps) {
  const entries = Object.entries(counts);
  const max = Math.max(1, ...entries.map(([, v]) => v));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-400">{total} total</span>
      </div>
      <div className="space-y-2">
        {entries.map(([label, value]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-24 text-xs text-gray-500 capitalize flex-shrink-0">{label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${(value / max) * 100}%` }}
              />
            </div>
            <span className="w-6 text-xs font-medium text-gray-600 text-right flex-shrink-0">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}