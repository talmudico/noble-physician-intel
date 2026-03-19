import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DataTable from '../shared/DataTable';

export default function UtilizationTab({ physician }) {
  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['cms-claims', physician?.npi],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchCMSClaims', {
        npi: physician.npi,
      });
      return response.data?.data || [];
    },
    enabled: !!physician?.npi,
  });

  const columns = [
    { label: 'J-Code', key: 'HCPCS_Cd', render: (row) => <span className="font-mono text-xs text-muted-foreground">{row.HCPCS_Cd}</span> },
    { label: 'Drug', key: 'HCPCS_Desc', render: (row) => <span className="font-medium">{row.HCPCS_Desc}</span> },
    { label: 'Total Claims', key: 'Tot_Srvcs', render: (row) => <span className="font-semibold">{row.Tot_Srvcs}</span> },
    { label: 'Total Patients', key: 'Tot_Benes' },
    { label: 'Medicare Allowed Amt', key: 'Tot_Mdcr_Alowd_Amt', render: (row) => row.Tot_Mdcr_Alowd_Amt ? `$${parseFloat(row.Tot_Mdcr_Alowd_Amt).toLocaleString()}` : '—' },
  ];

  return (
    <DataTable
      title="Drug Utilization (Noble Infusion Therapies Only)"
      columns={columns}
      data={claims}
      exportFilename={`utilization_${physician?.npi}`}
      emptyMessage={isLoading ? 'Loading CMS data...' : 'No utilization data found for this physician.'}
    />
  );
}