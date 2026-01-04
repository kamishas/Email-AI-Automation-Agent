import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Type, ArrowRight } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '../config/api';
import { useCampaignContext } from '../context/CampaignContext';
import { VariantCard } from '../components/VariantCard';
import { ComplianceChecker } from '../components/ComplianceChecker';
import { ImageUploader } from '../components/ImageUploader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';

interface ComposerProps {
  onNavigate: (page: string) => void;
}

export function Composer({ onNavigate }: ComposerProps) {
  const { currentCampaign, updateEmailContent } = useCampaignContext();
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');

  // Manual mode state
  const [manualSubject, setManualSubject] = useState(currentCampaign?.subject || '');
  const [manualBody, setManualBody] = useState(currentCampaign?.body || '');

  // AI mode state
  const [aiIntent, setAiIntent] = useState('');
  const [tone, setTone] = useState([50]); // 0-100 scale
  const [variationCount, setVariationCount] = useState(3);
  const [variants, setVariants] = useState<Array<{ id: string; subject: string; body: string }>>([]);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Compliance state
  const [isCompliant, setIsCompliant] = useState(true);
  const [complianceViolations, setComplianceViolations] = useState<any[]>([]);

  // Update manual fields when currentCampaign changes
  useEffect(() => {
    console.log('[Composer] currentCampaign changed:', currentCampaign);
    if (currentCampaign) {
      setManualSubject(currentCampaign.subject || '');
      setManualBody(currentCampaign.body || '');
    }
  }, [currentCampaign]);

  const handleGenerateAI = async () => {
    if (!aiIntent.trim()) {
      alert('Please enter your intent for the email');
      return;
    }

    setIsGenerating(true);

    try {
      const toneLabel = tone[0] < 33 ? 'Professional' : tone[0] < 66 ? 'Friendly' : 'Casual';

      const response = await apiClient.post(API_ENDPOINTS.AI.GENERATE, {
        intent: aiIntent,
        tone: toneLabel,
        count: variationCount
      });

      if (response && response.variations) {
        setVariants(response.variations);
      } else {
        throw new Error('No variations returned');
      }
    } catch (error) {
      console.error('Failed to generate AI content:', error);
      alert('Failed to generate email variations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndContinue = () => {
    if (!currentCampaign) {
      alert('Please select or create a campaign first');
      return;
    }

    let subject = '';
    let body = '';

    if (mode === 'manual') {
      subject = manualSubject;
      body = manualBody;
    } else if (selectedVariant) {
      const variant = variants.find(v => v.id === selectedVariant);
      if (variant) {
        subject = variant.subject;
        body = variant.body;
      }
    }

    if (!subject || !body) {
      alert('Please compose your email content');
      return;
    }

    // Check compliance before saving
    if (!isCompliant && complianceViolations.length > 0) {
      const criticalCount = complianceViolations.filter(v => v.severity === 'CRITICAL').length;
      if (criticalCount > 0) {
        alert(`Cannot proceed: ${criticalCount} critical compliance violation(s) detected. Please fix them before continuing.`);
        return;
      }

      const confirmed = confirm(`Warning: ${complianceViolations.length} compliance issue(s) detected. Do you want to proceed anyway?`);
      if (!confirmed) return;
    }

    updateEmailContent(currentCampaign.id, subject, body);
    onNavigate('launchpad');
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

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => onNavigate('import')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Email Composer</h1>
          <p className="text-gray-600">
            Campaign: <span className="font-medium text-gray-900">{currentCampaign.name}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Mode Toggle */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 inline-flex gap-2">
          <button
            onClick={() => setMode('manual')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${mode === 'manual'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Type className="w-5 h-5" />
            Manual Write
          </button>
          <button
            onClick={() => setMode('ai')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${mode === 'ai'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Sparkles className="w-5 h-5" />
            AI Auto-Generate
          </button>
        </div>

        {/* Manual Mode */}
        {mode === 'manual' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <Label htmlFor="subject" className="text-base font-semibold mb-3 block">
                Subject Line
              </Label>
              <Input
                id="subject"
                type="text"
                placeholder="Enter your email subject..."
                value={manualSubject}
                onChange={(e) => setManualSubject(e.target.value)}
                className="text-base"
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <Label htmlFor="body" className="text-base font-semibold mb-3 block">
                Email Body
              </Label>
              <Textarea
                id="body"
                placeholder="Compose your email message here...&#10;&#10;Tip: Use {{firstName}} and {{lastName}} for personalization"
                value={manualBody}
                onChange={(e) => setManualBody(e.target.value)}
                rows={12}
                className="text-base resize-none"
              />
              <p className="text-sm text-gray-500 mt-3">
                💡 Pro tip: Use {`{{firstName}}`}, {`{{lastName}}`}, {`{{company}}`} for dynamic personalization
              </p>
            </div>

            {/* Image Upload */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <Label className="text-base font-semibold mb-3 block">
                Add Images
              </Label>
              <ImageUploader onImageUploaded={(url) => console.log('Image uploaded:', url)} />
            </div>

            {/* Compliance Checker */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <Label className="text-base font-semibold mb-3 block">
                Compliance Check
              </Label>
              <ComplianceChecker
                subject={manualSubject}
                body={manualBody}
                onValidation={(result) => {
                  setIsCompliant(result.isCompliant);
                  setComplianceViolations(result.violations);
                }}
              />
            </div>
          </div>
        )}

        {/* AI Mode */}
        {mode === 'ai' && (
          <div className="space-y-6">
            {/* AI Configuration */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                AI Configuration
              </h2>

              <div className="space-y-6">
                {/* User Intent */}
                <div>
                  <Label htmlFor="intent" className="text-base font-medium mb-3 block">
                    What's your email intent?
                  </Label>
                  <Textarea
                    id="intent"
                    placeholder="E.g., 'Welcome new hires to the company and introduce them to our culture'"
                    value={aiIntent}
                    onChange={(e) => setAiIntent(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tone Slider */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      Tone: {tone[0] < 33 ? 'Professional' : tone[0] < 66 ? 'Friendly' : 'Casual'}
                    </Label>
                    <div className="pt-2">
                      <Slider
                        value={tone}
                        onValueChange={setTone}
                        max={100}
                        step={1}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Professional</span>
                        <span>Friendly</span>
                        <span>Casual</span>
                      </div>
                    </div>
                  </div>

                  {/* Variation Count */}
                  <div>
                    <Label htmlFor="variations" className="text-base font-medium mb-3 block">
                      Number of Variations
                    </Label>
                    <Input
                      id="variations"
                      type="number"
                      min={1}
                      max={5}
                      value={variationCount}
                      onChange={(e) => setVariationCount(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      Generating Variations...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Email Variations
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Generated Variants */}
            {variants.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Generated Variations ({variants.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {variants.map((variant) => (
                    <VariantCard
                      key={variant.id}
                      variant={variant}
                      isSelected={selectedVariant === variant.id}
                      onSelect={() => setSelectedVariant(variant.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save and Continue */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveAndContinue}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save & Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
