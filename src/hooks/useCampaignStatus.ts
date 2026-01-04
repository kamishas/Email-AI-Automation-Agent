import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

export interface CampaignStatusData {
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  progress: number;
  isComplete: boolean;
}

/**
 * Custom hook for polling campaign send status
 * 
 * In production, this will poll AWS API Gateway to get real-time status
 * Currently uses mock data for demonstration
 */
export function useCampaignStatus(campaignId: string | null, shouldPoll: boolean = false) {
  const [status, setStatus] = useState<CampaignStatusData>({
    totalRecipients: 0,
    sentCount: 0,
    failedCount: 0,
    pendingCount: 0,
    progress: 0,
    isComplete: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId || !shouldPoll) {
      return;
    }

    const fetchStatus = async () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual API call
        // const data = await apiClient.get(API_ENDPOINTS.SEND.STATUS(campaignId));
        // setStatus(data);

        // Mock polling behavior
        const mockStatus: CampaignStatusData = {
          totalRecipients: 100,
          sentCount: Math.floor(Math.random() * 100),
          failedCount: Math.floor(Math.random() * 5),
          pendingCount: 0,
          progress: 0,
          isComplete: false,
        };

        mockStatus.pendingCount = mockStatus.totalRecipients - mockStatus.sentCount - mockStatus.failedCount;
        mockStatus.progress = (mockStatus.sentCount + mockStatus.failedCount) / mockStatus.totalRecipients * 100;
        mockStatus.isComplete = mockStatus.pendingCount === 0;

        setStatus(mockStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch campaign status');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll every 3 seconds if shouldPoll is true
    const interval = setInterval(fetchStatus, 3000);

    return () => clearInterval(interval);
  }, [campaignId, shouldPoll]);

  return { status, loading, error };
}
