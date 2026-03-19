import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Building2, Users } from 'lucide-react';

export default function PhysicianHeader({ physician }) {
  if (!physician) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-primary">
              {physician.first_name?.[0]}{physician.last_name?.[0]}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {physician.first_name} {physician.last_name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">{physician.specialty || 'Unknown Specialty'}</Badge>
              <span className="text-xs font-mono text-muted-foreground">NPI: {physician.npi}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              {physician.practice_group && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {physician.practice_group}
                </span>
              )}
              {physician.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {physician.city}, {physician.state} {physician.zip_code}
                </span>
              )}
              {physician.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {physician.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 px-4 py-3 rounded-lg">
          <Users className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Total Patients</p>
            <p className="text-lg font-bold text-foreground">{physician.total_patients?.toLocaleString() || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}