import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Building2, Pill, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PhysicianHeader from '../components/physician/PhysicianHeader';
import PatientPopulationTab from '../components/physician/PatientPopulationTab';
import PracticeDetailsTab from '../components/physician/PracticeDetailsTab';
import UtilizationTab from '../components/physician/UtilizationTab';
import OrderShareTab from '../components/physician/OrderShareTab';

function parseNPPESPhysician(result) {
  if (!result) return null;
  const basic = result.basic || {};
  const address = result.addresses?.find(a => a.address_purpose === 'LOCATION') || result.addresses?.[0] || {};
  const taxonomy = result.taxonomies?.find(t => t.primary) || result.taxonomies?.[0] || {};
  return {
    npi: String(result.number),
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
}

export default function PhysicianProfile() {
  const pathParts = window.location.pathname.split('/');
  const npi = pathParts[pathParts.length - 1];

  const { data: physician, isLoading } = useQuery({
    queryKey: ['physician-nppes', npi],
    queryFn: async () => {
      const response = await base44.functions.invoke('searchNPPES', { query: `number=${npi}` });
      const results = response.data?.results;
      return parseNPPESPhysician(results?.[0]);
    },
    enabled: !!npi,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!physician) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-center py-20">
        <p className="text-muted-foreground">Physician not found.</p>
        <Link to="/">
          <Button variant="outline" className="mt-4">Back to Search</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Search
      </Link>

      <PhysicianHeader physician={physician} />

      <Tabs defaultValue="population" className="mt-6">
        <TabsList className="bg-card border border-border h-11 p-1">
          <TabsTrigger value="population" className="gap-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="w-3.5 h-3.5" />
            Patient Population
          </TabsTrigger>
          <TabsTrigger value="practice" className="gap-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Building2 className="w-3.5 h-3.5" />
            Practice Details
          </TabsTrigger>
          <TabsTrigger value="utilization" className="gap-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Pill className="w-3.5 h-3.5" />
            Utilization
          </TabsTrigger>
          <TabsTrigger value="order-share" className="gap-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Share2 className="w-3.5 h-3.5" />
            Order Share
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="population">
            <PatientPopulationTab physician={physician} />
          </TabsContent>
          <TabsContent value="practice">
            <PracticeDetailsTab physician={physician} />
          </TabsContent>
          <TabsContent value="utilization">
            <UtilizationTab physician={physician} />
          </TabsContent>
          <TabsContent value="order-share">
            <OrderShareTab physician={physician} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}