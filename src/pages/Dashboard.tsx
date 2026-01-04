import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useCampaignContext } from '../context/CampaignContext';
import { CampaignCard } from '../components/CampaignCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { campaigns, selectCampaign, createCampaign } = useCampaignContext();
  const [searchQuery, setSearchQuery] = useState('');

  const handleNewCampaign = () => {
    const name = `Campaign ${campaigns.length + 1}`;
    const newCampaign = createCampaign(name);
    selectCampaign(newCampaign.id);
    onNavigate('import');
  };

  const handleCampaignClick = (campaignId: string) => {
    selectCampaign(campaignId);
    onNavigate('launchpad');
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Campaigns</h1>
              <p className="text-gray-600">
                Manage your email campaigns and track their performance
              </p>
            </div>
            <Button
              onClick={handleNewCampaign}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Campaign
            </Button>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="default">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Campaign Grid */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {filteredCampaigns.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first campaign to start sending emails
            </p>
            <Button onClick={handleNewCampaign} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-5 h-5 mr-2" />
              Create Campaign
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onClick={() => handleCampaignClick(campaign.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
