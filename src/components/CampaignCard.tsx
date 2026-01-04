import React from 'react';
import { Calendar, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Campaign } from '../context/CampaignContext';
import { Badge } from './ui/badge';

interface CampaignCardProps {
  campaign: Campaign;
  onClick: () => void;
}

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  const getStatusConfig = () => {
    switch (campaign.status) {
      case 'sent':
        return {
          badge: <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Sent</Badge>,
          icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
          color: 'green',
        };
      case 'scheduled':
        return {
          badge: <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Scheduled</Badge>,
          icon: <Clock className="w-4 h-4 text-blue-600" />,
          color: 'blue',
        };
      default:
        return {
          badge: <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Draft</Badge>,
          icon: <Clock className="w-4 h-4 text-gray-600" />,
          color: 'gray',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const progress = campaign.totalRecipients > 0 
    ? (campaign.sentCount / campaign.totalRecipients) * 100 
    : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all text-left group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-700 transition-colors">
            {campaign.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(campaign.createdAt)}</span>
          </div>
        </div>
        <div className="ml-4">
          {statusConfig.badge}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{campaign.totalRecipients} recipients</span>
        </div>
        {campaign.failedCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-600">{campaign.failedCount} failed</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {campaign.status === 'sent' && campaign.totalRecipients > 0 && (
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Delivery Progress</span>
            <span className="text-gray-900 font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-700 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>{campaign.sentCount} sent</span>
            <span>{campaign.failedCount} failed</span>
          </div>
        </div>
      )}
    </button>
  );
}
