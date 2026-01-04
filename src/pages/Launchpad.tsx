import React, { useState } from 'react';
import { ArrowLeft, Send, AlertTriangle, CheckCircle2, Eye } from 'lucide-react';
import { useCampaignContext, Recipient } from '../context/CampaignContext';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

interface LaunchpadProps {
  onNavigate: (page: string) => void;
}

export function Launchpad({ onNavigate }: LaunchpadProps) {
  const { currentCampaign, sendCampaign } = useCampaignContext();
  const [isSending, setIsSending] = useState(false);
  const [sendComplete, setSendComplete] = useState(false);
  const [viewRecipient, setViewRecipient] = useState<Recipient | null>(null);

  const renderEmailBody = (recipient: Recipient) => {
    if (!currentCampaign?.body) return '';
    let body = currentCampaign.body;
    body = body.replace(/{firstName}|{{firstName}}/g, recipient.firstName || 'Friend');
    body = body.replace(/{lastName}|{{lastName}}/g, recipient.lastName || '');
    body = body.replace(/{company}|{{company}}/g, recipient.company || 'your company');
    return body;
  };

  const handleSendCampaign = async () => {
    if (!currentCampaign) return;

    if (!currentCampaign.subject || !currentCampaign.body) {
      alert('Please compose your email content first');
      onNavigate('composer');
      return;
    }

    if (currentCampaign.recipients.length === 0) {
      alert('Please add recipients to your campaign first');
      onNavigate('import');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send this campaign to ${currentCampaign.recipients.length} recipients?`
    );

    if (!confirmed) return;

    setIsSending(true);

    // TODO: In production, this will call API_ENDPOINTS.SEND.CAMPAIGN(campaignId)
    // which triggers the Send Lambda
    await sendCampaign(currentCampaign.id);

    setIsSending(false);
    setSendComplete(true);
  };

  if (!currentCampaign) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Campaign Selected</h2>
          <p className="text-gray-600 mb-6">Please select or create a campaign first</p>
          <Button onClick={() => onNavigate('dashboard')} className="bg-blue-600 hover:bg-blue-700">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const pendingCount = currentCampaign.recipients.filter(r => r.status === 'pending').length;
  const sentCount = currentCampaign.recipients.filter(r => r.status === 'sent').length;
  const failedCount = currentCampaign.recipients.filter(r => r.status === 'failed').length;
  const progress = currentCampaign.recipients.length > 0
    ? ((sentCount + failedCount) / currentCampaign.recipients.length) * 100
    : 0;

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => onNavigate('composer')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Composer
          </button>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Launchpad</h1>
          <p className="text-gray-600">
            Campaign: <span className="font-medium text-gray-900">{currentCampaign.name}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Campaign Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Total Recipients</span>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900">{currentCampaign.recipients.length}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Sent Successfully</span>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-green-600">{sentCount}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Failed</span>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-red-600">{failedCount}</p>
          </div>
        </div>

        {/* Email Preview */}
        {currentCampaign.subject && currentCampaign.body && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Preview</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Subject</label>
                <p className="text-gray-900 font-medium">{currentCampaign.subject}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Body</label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{currentCampaign.body}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sending Progress */}
        {isSending && (
          <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Send className="w-6 h-6 text-blue-600 animate-pulse" />
              <h2 className="text-xl font-semibold text-gray-900">Sending Campaign...</h2>
            </div>
            <Progress value={progress} className="h-3 mb-2" />
            <p className="text-sm text-gray-600">
              {sentCount + failedCount} of {currentCampaign.recipients.length} emails processed
            </p>
          </div>
        )}

        {/* Success Message */}
        {sendComplete && (
          <div className="bg-green-50 rounded-xl border-2 border-green-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Campaign Sent!</h2>
            </div>
            <p className="text-gray-700">
              Successfully sent {sentCount} emails. {failedCount > 0 && `${failedCount} emails failed to send.`}
            </p>
          </div>
        )}

        {/* Recipients Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Recipients</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentCampaign.recipients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No recipients added yet. Please import contacts first.
                    </td>
                  </tr>
                ) : (
                  currentCampaign.recipients.map((recipient) => (
                    <tr key={recipient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-medium">
                          {recipient.firstName} {recipient.lastName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{recipient.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{recipient.company || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={recipient.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {recipient.sentAt
                            ? new Date(recipient.sentAt).toLocaleString()
                            : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewRecipient(recipient)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Send Button */}
        {!sendComplete && currentCampaign.status !== 'sent' && (
          <div className="flex justify-center">
            <Button
              onClick={handleSendCampaign}
              disabled={isSending || currentCampaign.recipients.length === 0}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-6 text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              <Send className="w-6 h-6 mr-3" />
              {isSending ? 'Sending Campaign...' : `Send Campaign to ${currentCampaign.recipients.length} Recipients`}
            </Button>
          </div>
        )}

        {/* Retry Button (Only if failed recipients exist) */}
        {failedCount > 0 && !isSending && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={async () => {
                const confirmed = window.confirm(`Retry sending to ${failedCount} failed recipients?`);
                if (!confirmed) return;

                setIsSending(true);
                await sendCampaign(currentCampaign.id, true); // Retry = true
                setIsSending(false);
                setSendComplete(true);
              }}
              variant="outline"
              size="lg"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              Retry Failed Recipients
            </Button>
          </div>
        )}
      </div>

      {/* View Email Dialog */}
      <Dialog open={!!viewRecipient} onOpenChange={() => setViewRecipient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sent Email Content</DialogTitle>
          </DialogHeader>
          {viewRecipient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">To:</span>
                  <span className="font-medium">{viewRecipient.email}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Sent At:</span>
                  <span className="font-medium">
                    {viewRecipient.sentAt ? new Date(viewRecipient.sentAt).toLocaleString() : 'Not sent yet'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <span className="text-gray-500 block text-sm mb-2">Subject:</span>
                <p className="font-medium text-gray-900">{currentCampaign.subject}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-[400px] overflow-y-auto">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {renderEmailBody(viewRecipient)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
