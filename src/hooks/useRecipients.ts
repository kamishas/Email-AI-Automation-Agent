import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { Recipient } from '../context/CampaignContext';

/**
 * Custom hook for fetching recipients for a specific campaign
 * 
 * In production, this will fetch from AWS API Gateway
 * Currently uses mock data for demonstration
 */
export function useRecipients(campaignId: string | null) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) {
      setRecipients([]);
      return;
    }

    const fetchRecipients = async () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual API call
        // const data = await apiClient.get(API_ENDPOINTS.RECIPIENTS.LIST(campaignId));
        // setRecipients(data.recipients);

        // For now, return empty array - real data will come from the campaign context
        setRecipients([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recipients');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipients();
  }, [campaignId]);

  return { recipients, loading, error };
}