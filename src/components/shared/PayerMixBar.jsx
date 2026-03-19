import React from 'react';

const segments = [
  { key: 'medicare_ffs_pct', label: 'Medicare FFS', color: 'bg-blue-500' },
  { key: 'medicare_advantage_pct', label: 'Medicare Adv', color: 'bg-sky-400' },
  { key: 'medicaid_pct', label: 'Medicaid', color: 'bg-emerald-500' },
  { key: 'commercial_pct', label: 'Commercial', color: 'bg-amber-500' },
  { key: 'other_pct', label: 'Other', color: 'bg-slate-400' },
];

export default function PayerMixBar({ physician }) {
  if (!physician) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Payer Mix</h3>
      <div className="h-4 rounded-full overflow-hidden flex bg-muted">
        {segments.map(seg => {
          const val = physician[seg.key] || 0;
          if (val === 0) return null;
          return (
            <div
              key={seg.key}
              className={`${seg.color} h-full transition-all`}
              style={{ width: `${val}%` }}
              title={`${seg.label}: ${val}%`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 mt-3">
        {segments.map(seg => {
          const val = physician[seg.key] || 0;
          return (
            <div key={seg.key} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${seg.color}`} />
              <span className="text-xs text-muted-foreground">{seg.label}</span>
              <span className="text-xs font-semibold text-foreground">{val}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}