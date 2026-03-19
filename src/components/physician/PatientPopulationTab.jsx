import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DataTable from '../shared/DataTable';
import PayerMixBar from '../shared/PayerMixBar';

export default function PatientPopulationTab({ physician }) {
  const { data: volumes = [] } = useQuery({
    queryKey: ['patient-volumes', physician?.npi],
    queryFn: () => base44.entities.PatientVolume.filter({ physician_npi: physician.npi }),
    enabled: !!physician?.npi,
  });

  const volumeColumns = [
    { label: 'Quarter', key: 'quarter' },
    { label: 'Medicare FFS', key: 'medicare_ffs_count' },
    { label: 'Medicare Adv', key: 'ma_count' },
    { label: 'Medicaid', key: 'medicaid_count' },
    { label: 'Commercial', key: 'commercial_count' },
    { label: 'Other', key: 'other_count' },
    { label: 'Total', key: 'total_count', render: (row) => <span className="font-semibold">{row.total_count}</span> },
  ];

  return (
    <div className="space-y-6">
      <PayerMixBar physician={physician} />

      <DataTable
        title="Patient Volume by Quarter"
        columns={volumeColumns}
        data={volumes}
        exportFilename={`patient_volume_${physician?.npi}`}
        emptyMessage="No patient volume data available. Import CMS data to populate."
      />
    </div>
  );
}