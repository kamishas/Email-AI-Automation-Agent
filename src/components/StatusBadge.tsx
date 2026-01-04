import React from 'react';
import { RecipientStatus } from '../context/CampaignContext';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: RecipientStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const configs = {
    pending: {
      label: 'Pending',
      className: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: <Clock className="w-3 h-3" />,
    },
    sent: {
      label: 'Sent',
      className: 'bg-green-100 text-green-700 border-green-200',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    failed: {
      label: 'Failed',
      className: 'bg-red-100 text-red-700 border-red-200',
      icon: <XCircle className="w-3 h-3" />,
    },
  };

  const config = configs[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}
