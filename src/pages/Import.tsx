import React, { useState } from 'react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useCampaignContext } from '../context/CampaignContext';
import RecipientSelector from '../components/campaign/RecipientSelector';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

interface ImportProps {
  onNavigate: (page: string) => void;
}

export function Import({ onNavigate }: ImportProps) {
  const {
    campaigns,
    currentCampaign,
    stagingRecipients,
    setStagingRecipients,
    addStagingRecipient,
    updateStagingRecipient,
    deleteStagingRecipient,
    saveRecipientsToDatabase,
    createCampaign,
    selectCampaign,
  } = useCampaignContext();

  const [groupingMode, setGroupingMode] = useState<'new' | 'existing'>('new');
  const [newCampaignName, setNewCampaignName] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<any[]>([]);

  const handleRecipientsChange = (recipients: any[]) => {
    setSelectedRecipients(recipients);
    // Convert to staging format
    const stagingFormat = recipients.map((contact, index) => ({
      id: `staging-${Date.now()}-${index}`,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      company: contact.company || '',
      status: 'pending' as const,
    }));
    setStagingRecipients(stagingFormat);
  };

  const handleSaveToDatabase = async () => {
    let targetCampaignId: string;

    if (groupingMode === 'new') {
      if (!newCampaignName.trim()) {
        alert('Please enter a campaign name');
        return;
      }
      // createCampaign already sets currentCampaign internally
      const targetCampaign = createCampaign(newCampaignName);
      targetCampaignId = targetCampaign.id;
    } else {
      if (!selectedCampaignId) {
        alert('Please select a campaign');
        return;
      }
      targetCampaignId = selectedCampaignId;
      // Select the existing campaign
      selectCampaign(targetCampaignId);
    }

    // Save recipients to the campaign - WAIT for it to complete
    await saveRecipientsToDatabase(targetCampaignId);

    // Navigate to composer after save completes
    onNavigate('composer');
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Import Contacts</h1>
          <p className="text-gray-600">
            Upload a CSV file or manually add recipients to your campaign
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Step 1: Campaign Assignment */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Campaign Assignment</h2>
          </div>

          <RadioGroup value={groupingMode} onValueChange={(value: 'new' | 'existing') => setGroupingMode(value)}>
            <div className="space-y-4">
              {/* New Campaign Option */}
              <div className={`border-2 rounded-xl p-4 transition-all ${groupingMode === 'new' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}>
                <div className="flex items-center space-x-3 mb-3">
                  <RadioGroupItem value="new" id="new" />
                  <Label htmlFor="new" className="font-medium text-gray-900 cursor-pointer">
                    Create New Campaign Group
                  </Label>
                </div>
                {groupingMode === 'new' && (
                  <div className="ml-7">
                    <Input
                      type="text"
                      placeholder="Enter campaign name..."
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                )}
              </div>

              {/* Existing Campaign Option */}
              <div className={`border-2 rounded-xl p-4 transition-all ${groupingMode === 'existing' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}>
                <div className="flex items-center space-x-3 mb-3">
                  <RadioGroupItem value="existing" id="existing" />
                  <Label htmlFor="existing" className="font-medium text-gray-900 cursor-pointer">
                    Add to Existing Campaign
                  </Label>
                </div>
                {groupingMode === 'existing' && (
                  <div className="ml-7">
                    <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                      <SelectTrigger className="max-w-md">
                        <SelectValue placeholder="Select a campaign..." />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns.map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Step 2: Select Recipients */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Add Recipients</h2>
          </div>

          <RecipientSelector
            onRecipientsChange={handleRecipientsChange}
            initialRecipients={selectedRecipients}
          />
        </div>

        {/* Action Buttons */}
        {selectedRecipients.length > 0 && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">
                <strong className="text-gray-900">{selectedRecipients.length} recipients</strong> selected
              </span>
            </div>
            <Button
              onClick={handleSaveToDatabase}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-5 h-5 mr-2" />
              Continue to Composer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
