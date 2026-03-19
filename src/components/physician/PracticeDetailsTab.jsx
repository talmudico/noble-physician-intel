import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DataTable from '../shared/DataTable';

export default function PracticeDetailsTab({ physician }) {
  const { data: billings = [] } = useQuery({
    queryKey: ['billing-affiliations', physician?.npi],
    queryFn: () => base44.entities.BillingAffiliation.filter({ physician_npi: physician.npi }),
    enabled: !!physician?.npi,
  });

  const { data: hospitals = [] } = useQuery({
    queryKey: ['hospital-affiliations', physician?.npi],
    queryFn: () => base44.entities.HospitalAffiliation.filter({ physician_npi: physician.npi }),
    enabled: !!physician?.npi,
  });

  const billingColumns = [
    { label: 'Medical Group', key: 'billing_group_name' },
    { label: 'Billing NPI', key: 'billing_npi' },
    { label: '% of Claims', key: 'claims_pct', render: (row) => `${row.claims_pct}%` },
  ];

  const hospitalColumns = [
    { label: 'Hospital', key: 'hospital_name' },
    { label: 'NPI', key: 'hospital_npi' },
    { label: 'Facility Type', key: 'facility_type' },
    { label: 'Affiliation %', key: 'affiliation_pct', render: (row) => `${row.affiliation_pct}%` },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Physician Billing"
        columns={billingColumns}
        data={billings}
        exportFilename={`billing_${physician?.npi}`}
        emptyMessage="No billing affiliation data available."
      />
      <DataTable
        title="Hospital Affiliations"
        columns={hospitalColumns}
        data={hospitals}
        exportFilename={`hospitals_${physician?.npi}`}
        emptyMessage="No hospital affiliation data available."
      />
    </div>
  );
}