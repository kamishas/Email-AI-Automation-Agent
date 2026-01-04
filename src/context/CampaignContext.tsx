import React, { createContext, useContext, useState, ReactNode } from 'react';

// Type Definitions
export type CampaignStatus = 'draft' | 'sent' | 'scheduled';
export type RecipientStatus = 'pending' | 'sent' | 'failed';

export interface Recipient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  status: RecipientStatus;
  sentAt?: string;
  errorMessage?: string;
}

export interface Campaign {
  id: string;
  name: string;
  createdAt: string;
  status: CampaignStatus;
  subject?: string;
  body?: string;
  recipients: Recipient[];
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
}

interface CampaignContextType {
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  stagingRecipients: Recipient[];

  // Campaign actions
  createCampaign: (name: string) => Campaign;
  selectCampaign: (campaignId: string) => void;
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (campaignId: string) => void;

  // Staging actions (before saving to database)
  setStagingRecipients: (recipients: Recipient[]) => void;
  addStagingRecipient: (recipient: Omit<Recipient, 'id'>) => void;
  updateStagingRecipient: (id: string, updates: Partial<Recipient>) => void;
  deleteStagingRecipient: (id: string) => void;
  clearStaging: () => void;

  // Save staging to campaign (this will trigger the Import Lambda in production)
  saveRecipientsToDatabase: (campaignId: string) => void;

  // Email content
  updateEmailContent: (campaignId: string, subject: string, body: string) => void;

  // Send campaign (with optional retry)
  sendCampaign: (campaignId: string, retry?: boolean) => Promise<void>;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

import { apiClient, API_ENDPOINTS } from '../config/api';

// ... (imports remain the same)

// ... (interfaces remain the same)

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [stagingRecipients, setStagingRecipientsState] = useState<Recipient[]>([]);

  // Fetch campaigns on mount
  React.useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CAMPAIGNS.LIST);
      if (response && response.campaigns) {
        // Map API response to Campaign interface
        const mappedCampaigns = response.campaigns.map((c: any) => ({
          ...c,
          id: c.campaignId || c.id,
          name: c.name || c.subject || `Campaign ${c.campaignId}`,
          recipients: c.recipients || [],
          totalRecipients: c.totalRecipients || 0,
          sentCount: c.sentCount || 0,
          failedCount: c.failedCount || 0,
          // Map backend 'completed' status to frontend 'sent' status
          status: (c.status === 'completed' ? 'sent' : c.status) || 'draft',
          // Map backend 'bodyTemplate' to frontend 'body'
          body: c.body || c.bodyTemplate || '',
          createdAt: c.createdAt || new Date().toISOString()
        }));
        setCampaigns(mappedCampaigns);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    }
  };

  const createCampaign = (name: string): Campaign => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
      status: 'draft',
      recipients: [],
      totalRecipients: 0,
      sentCount: 0,
      failedCount: 0,
    };
    console.log('[CampaignContext] Creating campaign:', newCampaign);
    setCampaigns(prev => [...prev, newCampaign]);
    // Set as current campaign immediately to avoid async state issues
    console.log('[CampaignContext] Setting currentCampaign to:', newCampaign);
    setCurrentCampaign(newCampaign);
    // Also save to backend immediately if desired, but for now we keep local until saved
    return newCampaign;
  };

  const selectCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    console.log('[CampaignContext] selectCampaign called with ID:', campaignId, 'Found:', campaign);
    setCurrentCampaign(campaign || null);
  };

  const updateCampaign = (campaignId: string, updates: Partial<Campaign>) => {
    setCampaigns(prev =>
      prev.map(c => (c.id === campaignId ? { ...c, ...updates } : c))
    );
    if (currentCampaign?.id === campaignId) {
      setCurrentCampaign(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    if (currentCampaign?.id === campaignId) {
      setCurrentCampaign(null);
    }
  };

  const setStagingRecipients = (recipients: Recipient[]) => {
    setStagingRecipientsState(recipients);
  };

  const addStagingRecipient = (recipient: Omit<Recipient, 'id'>) => {
    const newRecipient: Recipient = {
      ...recipient,
      id: Date.now().toString(),
    };
    setStagingRecipientsState(prev => [...prev, newRecipient]);
  };

  const updateStagingRecipient = (id: string, updates: Partial<Recipient>) => {
    setStagingRecipientsState(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteStagingRecipient = (id: string) => {
    setStagingRecipientsState(prev => prev.filter(r => r.id !== id));
  };

  const clearStaging = () => {
    setStagingRecipientsState([]);
  };

  const saveRecipientsToDatabase = async (campaignId: string) => {
    try {
      // Loop through staging recipients and add them to the backend
      // Note: In a real app, we'd want a batch API, but for now we loop
      for (const recipient of stagingRecipients) {
        await apiClient.post(API_ENDPOINTS.RECIPIENTS.ADD(campaignId), {
          email: recipient.email,
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          company: recipient.company
        });
      }

      // Update local state
      setCampaigns(prev => prev.map(c => {
        if (c.id === campaignId) {
          const updatedRecipients = [...c.recipients, ...stagingRecipients];
          return {
            ...c,
            recipients: updatedRecipients,
            totalRecipients: updatedRecipients.length,
          };
        }
        return c;
      }));

      if (currentCampaign?.id === campaignId) {
        const updatedRecipients = [...currentCampaign.recipients, ...stagingRecipients];
        setCurrentCampaign({
          ...currentCampaign,
          recipients: updatedRecipients,
          totalRecipients: updatedRecipients.length,
        });
      }

      clearStaging();
      console.log(`✅ Recipients saved successfully! (${stagingRecipients.length} recipients)`);
    } catch (error) {
      console.error('Failed to save recipients:', error);
      alert('Failed to save recipients to backend.');
    }
  };

  const updateEmailContent = async (campaignId: string, subject: string, body: string) => {
    try {
      // Call backend to configure campaign
      await apiClient.post(API_ENDPOINTS.CAMPAIGNS.CONFIG(campaignId), {
        subject,
        bodyTemplate: body, // Backend expects bodyTemplate
        mode: 'manual'      // Backend expects lowercase manual
      });

      // Update local state
      updateCampaign(campaignId, { subject, body });
      alert('Campaign configuration saved!');
    } catch (error) {
      console.error('Failed to update email content:', error);
      alert('Failed to save campaign configuration.');
    }
  };

  const sendCampaign = async (campaignId: string, retry: boolean = false): Promise<void> => {
    try {
      // Call backend to send campaign
      await apiClient.post(API_ENDPOINTS.SEND.CAMPAIGN(campaignId), { retry });

      // Update local state to show sent
      // Note: In a real app, we'd poll for status, but here we'll assume success
      const campaign = campaigns.find(c => c.id === campaignId);
      if (campaign) {
        const updatedRecipients = campaign.recipients.map(r => ({
          ...r,
          status: 'sent' as RecipientStatus,
          sentAt: new Date().toISOString(),
        }));

        updateCampaign(campaignId, {
          recipients: updatedRecipients,
          status: 'sent',
          sentCount: updatedRecipients.length,
          failedCount: 0,
        });
      }
      alert('Campaign sent successfully!');
    } catch (error) {
      console.error('Failed to send campaign:', error);
      alert('Failed to send campaign.');
    }
  };

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        currentCampaign,
        stagingRecipients,
        createCampaign,
        selectCampaign,
        updateCampaign,
        deleteCampaign,
        setStagingRecipients,
        addStagingRecipient,
        updateStagingRecipient,
        deleteStagingRecipient,
        clearStaging,
        saveRecipientsToDatabase,
        updateEmailContent,
        sendCampaign,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaignContext() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaignContext must be used within a CampaignProvider');
  }
  return context;
}