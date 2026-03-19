import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DataTable from '../shared/DataTable';
import { Badge } from '@/components/ui/badge';

export default function OrderShareTab({ physician }) {
  const { data: referrals = [] } = useQuery({
    queryKey: ['referral-pairs', physician?.npi],
    queryFn: () => base44.entities.ReferralPair.filter({ source_npi: physician.npi }),
    enabled: !!physician?.npi,
  });

  const infusionReferrals = referrals.filter(r => r.destination_type !== 'Home Health Agency');
  const hhaReferrals = referrals.filter(r => r.destination_type === 'Home Health Agency');

  const orderColumns = [
    { label: 'Organization', key: 'destination_name', render: (row) => <span className="font-medium">{row.destination_name}</span> },
    { label: 'NPI', key: 'destination_npi', render: (row) => <span className="font-mono text-xs text-muted-foreground">{row.destination_npi}</span> },
    { label: 'Type', key: 'destination_type', render: (row) => (
      <Badge variant="secondary" className="text-xs font-medium">{row.destination_type}</Badge>
    )},
    { label: 'Drug', key: 'drug_name' },
    { label: 'County', key: 'county' },
    { label: 'Zip', key: 'zip_code' },
    { label: 'Order %', key: 'order_pct', render: (row) => {
      const pct = row.order_pct || 0;
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-semibold">{pct}%</span>
        </div>
      );
    }},
    { label: 'Shared Patients', key: 'shared_patient_count' },
    { label: 'Quarter', key: 'quarter' },
  ];

  const hhaColumns = [
    { label: 'Agency', key: 'destination_name', render: (row) => <span className="font-medium">{row.destination_name}</span> },
    { label: 'NPI', key: 'destination_npi', render: (row) => <span className="font-mono text-xs text-muted-foreground">{row.destination_npi}</span> },
    { label: 'County', key: 'county' },
    { label: 'Shared Patients', key: 'shared_patient_count' },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Order Share by Organization"
        columns={orderColumns}
        data={infusionReferrals}
        exportFilename={`order_share_${physician?.npi}`}
        emptyMessage="No referral data available."
      />
      <DataTable
        title="Home Health Agency Destinations"
        columns={hhaColumns}
        data={hhaReferrals}
        exportFilename={`hha_referrals_${physician?.npi}`}
        emptyMessage="No home health agency referral data."
      />
    </div>
  );
}