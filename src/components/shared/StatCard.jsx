import React from 'react';

export default function StatCard({ label, value, icon: Icon, color = "text-primary" }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
      {Icon && (
        <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}