import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User, ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

function buildNPPESQuery(searchText) {
  const q = searchText.trim();
  if (/^\d{10}$/.test(q)) return `number=${q}`;
  const parts = q.split(/\s+/);
  if (parts.length >= 2) {
    return `first_name=${encodeURIComponent(parts[0])}&last_name=${encodeURIComponent(parts.slice(1).join(' '))}&state=FL&enumeration_type=NPI-1&limit=50`;
  }
  return `last_name=${encodeURIComponent(parts[0])}&state=FL&enumeration_type=NPI-1&limit=50`;
}

function parseResults(data) {
  if (!data || !data.results || data.results.length === 0) return [];
  return data.results
    .filter(r => r.enumeration_type === 'NPI-1')
    .map(r => {
      const basic = r.basic || {};
      const address = r.addresses?.find(a => a.address_purpose === 'LOCATION') || r.addresses?.[0] || {};
      const taxonomy = r.taxonomies?.find(t => t.primary) || r.taxonomies?.[0] || {};
      return {
        npi: String(r.number),
        first_name: basic.first_name || '',
        last_name: basic.last_name || '',
        credential: basic.credential || '',
        specialty: taxonomy.desc || '',
        city: address.city || '',
        state: address.state || '',
        zip_code: (address.postal_code || '').substring(0, 5),
        address: address.address_1 || '',
        phone: address.telephone_number || '',
      };
    });
}

export default function PhysicianSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) return;
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const query = buildNPPESQuery(q);
      const response = await base44.functions.invoke('searchNPPES', { query });
      const data = response.data;
      setResults(parseResults(data));
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="text-center mb-12 mt-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Physician Intelligence</h1>
        <p className="text-muted-foreground mt-2 text-base">
          Search any physician by name or NPI to view patient population, utilization, and referral patterns.
        </p>
        <p className="text-xs text-muted-foreground mt-1">Live data from CMS NPPES National Provider Registry</p>
        <form onSubmit={handleSearch} className="mt-8 flex items-center gap-3 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name (e.g., Vance Wilson) or NPI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base bg-card border-border"
            />
          </div>
          <Button type="submit" className="h-12 px-6" disabled={!searchTerm.trim() || isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && <div className="text-center py-12"><p className="text-destructive">{error}</p></div>}

      {hasSearched && !isLoading && !error && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No physicians found for "{searchTerm}"</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different name or a 10-digit NPI. Name searches filter to Florida.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-4">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
          {results.map((physician) => (
            <Link
              key={physician.npi}
              to={`/physician/${physician.npi}`}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {physician.first_name} {physician.last_name}
                    {physician.credential && <span className="text-muted-foreground font-normal text-sm ml-1">, {physician.credential}</span>}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="font-mono">NPI: {physician.npi}</span>
                    {physician.specialty && <Badge variant="secondary" className="text-[10px] py-0">{physician.specialty}</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {physician.city && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{physician.city}, {physician.state} {physician.zip_code}</span>
                    )}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      )}

      {!hasSearched && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Enter a physician name or NPI number to get started</p>
        </div>
      )}
    </div>
  );
}