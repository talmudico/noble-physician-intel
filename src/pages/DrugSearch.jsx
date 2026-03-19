import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pill, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import DataTable from '../components/shared/DataTable';

export default function DrugSearch() {
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [zipFilter, setZipFilter] = useState('');

  const { data: drugMap = [] } = useQuery({
    queryKey: ['drug-map'],
    queryFn: () => base44.entities.DrugMap.list('-drug_name', 200),
  });

  const { data: cmsResults = [], isLoading } = useQuery({
    queryKey: ['cms-by-drug', selectedDrug?.j_code],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchCMSByDrug', {
        jcode: selectedDrug.j_code,
        state: 'FL',
      });
      const records = Array.isArray(response.data) ? response.data : (response.data?.data || response.data || []);
      return records.sort((a, b) => (Number(b.Tot_Srvcs) || 0) - (Number(a.Tot_Srvcs) || 0));
    },
    enabled: !!selectedDrug?.j_code,
  });

  const results = useMemo(() => {
    if (!zipFilter.trim()) return cmsResults;
    return cmsResults.filter(row =>
      (row.Rndrng_Prvdr_Zip5 || '').startsWith(zipFilter.trim())
    );
  }, [cmsResults, zipFilter]);

  const resultColumns = [
    {
      label: 'Physician',
      key: 'physician_name',
      render: (row) => (
        <Link to={`/physician/${row.Rndrng_NPI}`} className="font-medium hover:text-primary transition-colors">
          {row.Rndrng_Prvdr_Last_Org_Name}
          {row.Rndrng_Prvdr_First_Name ? `, ${row.Rndrng_Prvdr_First_Name}` : ''}
          {row.Rndrng_Prvdr_Crdntls ? <span className="text-muted-foreground font-normal text-xs ml-1">{row.Rndrng_Prvdr_Crdntls}</span> : null}
        </Link>
      ),
    },
    {
      label: 'NPI',
      key: 'Rndrng_NPI',
      render: (row) => <span className="font-mono text-xs text-muted-foreground">{row.Rndrng_NPI}</span>,
    },
    {
      label: 'Specialty',
      key: 'Rndrng_Prvdr_Type',
      render: (row) => <span className="text-sm">{row.Rndrng_Prvdr_Type || '—'}</span>,
    },
    {
      label: 'City',
      key: 'Rndrng_Prvdr_City',
      render: (row) => row.Rndrng_Prvdr_City || '—',
    },
    {
      label: 'Zip',
      key: 'Rndrng_Prvdr_Zip5',
      render: (row) => row.Rndrng_Prvdr_Zip5 || '—',
    },
    {
      label: 'Total Claims',
      key: 'Tot_Srvcs',
      render: (row) => <span className="font-semibold">{row.Tot_Srvcs ?? '—'}</span>,
    },
    {
      label: 'Total Patients',
      key: 'Tot_Benes',
      render: (row) => row.Tot_Benes ?? '—',
    },
    {
      label: 'Avg Medicare Payment',
      key: 'Avg_Mdcr_Pymt_Amt',
      render: (row) =>
        row.Avg_Mdcr_Pymt_Amt != null
          ? `$${parseFloat(row.Avg_Mdcr_Pymt_Amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : '—',
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Pill className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Reverse Drug Search</h1>
            <p className="text-sm text-muted-foreground">Find every physician prescribing a specific drug in your target area</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Search Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Drug</label>
            <Select
              value={selectedDrug?.id || ''}
              onValueChange={(id) => setSelectedDrug(drugMap.find(d => d.id === id) || null)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select a drug..." />
              </SelectTrigger>
              <SelectContent>
                {drugMap.map(drug => (
                  <SelectItem key={drug.id} value={drug.id}>
                    {drug.drug_name} ({drug.j_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Zip Code (optional)</label>
            <Input
              placeholder="Filter by zip..."
              value={zipFilter}
              onChange={(e) => setZipFilter(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>
      </div>

      {selectedDrug ? (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-primary/10 text-primary border-0 text-xs">{selectedDrug.drug_name}</Badge>
            {isLoading && <span className="text-sm text-muted-foreground">Loading CMS data...</span>}
            {!isLoading && (
              <span className="text-sm text-muted-foreground">
                {results.length} prescriber{results.length !== 1 ? 's' : ''} found
              </span>
            )}
          </div>
          <DataTable
            columns={resultColumns}
            data={results}
            exportFilename={`drug_search_${selectedDrug.drug_name}`}
            emptyMessage={isLoading ? 'Loading...' : `No physicians found prescribing ${selectedDrug.drug_name} in FL.`}
          />
        </>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Pill className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Select a drug to see all prescribing physicians in Florida</p>
        </div>
      )}
    </div>
  );
}