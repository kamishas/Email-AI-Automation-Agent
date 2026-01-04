import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { FileUpload } from '../../../components/FileUpload';
import { ImportAnalyzer, AnalysisResult, AnalyzedContact } from '../../../utils/importAnalyzer';
import { AnalysisReview } from './AnalysisReview';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '../../../config/api';

interface ImportWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export function ImportWizard({ isOpen, onClose, onComplete }: ImportWizardProps) {
    const [step, setStep] = useState<'upload' | 'analyzing' | 'review' | 'saving'>('upload');
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [bulkTag, setBulkTag] = useState<string>('');
    const [availableTags, setAvailableTags] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchTags();
        }
    }, [isOpen]);

    const fetchTags = async () => {
        try {
            const res = await apiClient.get(API_ENDPOINTS.CONTACTS.TAGS);
            if (res && res.tags && Array.isArray(res.tags)) {
                setAvailableTags(res.tags.map((t: any) => t.tagName));
            }
        } catch (err) {
            console.error('Failed to fetch tags', err);
        }
    };

    const handleFileSelect = async (file: File) => {
        setStep('analyzing');
        try {
            const result = await ImportAnalyzer.analyze(file);
            setAnalysis(result);
            setStep('review');
        } catch (err) {
            alert('Error analyzing file');
            setStep('upload');
        }
    };

    const handleResolveConflict = (email: string, resolution: 'db' | 'csv') => {
        if (!analysis) return;

        // Move from conflicts -> valid
        const conflictIndex = analysis.conflicts.findIndex(c => c.importData.email === email);
        if (conflictIndex === -1) return;

        const conflict = analysis.conflicts[conflictIndex];
        const resolved: AnalyzedContact = {
            ...conflict,
            status: 'existing',
            importData: resolution === 'csv' ? conflict.importData : conflict.currentData! // Use DB data if kept
        };

        setAnalysis({
            ...analysis,
            conflicts: analysis.conflicts.filter((_, i) => i !== conflictIndex),
            valid: [...analysis.valid, resolved]
        });
    };

    const handleDeleteContact = (email: string) => {
        if (!analysis) return;

        setAnalysis({
            ...analysis,
            valid: analysis.valid.filter(c => c.importData.email !== email)
        });
    };

    const handleUpdateContactTags = (email: string, tags: string[]) => {
        if (!analysis) return;

        setAnalysis({
            ...analysis,
            valid: analysis.valid.map(c =>
                c.importData.email === email
                    ? { ...c, importData: { ...c.importData, tags } }
                    : c
            )
        });
    };

    const handleResolveAll = (action: 'skip' | 'overwrite') => {
        if (!analysis) return;

        const resolved = analysis.conflicts.map(c => ({
            ...c,
            status: 'existing' as const,
            importData: action === 'overwrite' ? c.importData : c.currentData!
        }));

        setAnalysis({
            ...analysis,
            conflicts: [],
            valid: [...analysis.valid, ...resolved]
        });
    };

    const handleSave = async () => {
        if (!analysis) return;
        setStep('saving');

        // Only save VALID rows
        // Note: We ignore 'invalid' rows here. In a real app we might offer to download them.

        try {
            let contactsToSave = analysis.valid.map(c => c.importData);

            // Apply bulk tag if selected
            if (bulkTag) {
                contactsToSave = contactsToSave.map(contact => ({
                    ...contact,
                    tags: contact.tags.includes(bulkTag)
                        ? contact.tags
                        : [...contact.tags, bulkTag]
                }));
            }

            await apiClient.post(API_ENDPOINTS.CONTACTS.BATCH, {
                contacts: contactsToSave
            });

            onComplete();
            onClose();
            // Reset state
            setStep('upload');
            setAnalysis(null);
            setBulkTag('');
        } catch (err) {
            alert('Failed to save batch');
            setStep('review');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[75vh] flex flex-col p-0 gap-0">
                {/* HEADER - Fixed at top */}
                <DialogHeader className="px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
                    <DialogTitle className="text-xl font-bold text-gray-900">Import Contacts Wizard</DialogTitle>
                    <DialogDescription className="text-xs text-gray-600 mt-0.5">
                        Upload a CSV to bulk add contacts. We'll validate format and check for duplicates.
                    </DialogDescription>
                </DialogHeader>

                {/* CONTENT - Scrollable middle section */}
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(75vh - 160px)' }}>
                    {step === 'upload' && (
                        <div className="p-8 flex items-center justify-center min-h-[300px]">
                            <FileUpload onFileSelect={handleFileSelect} />
                        </div>
                    )}

                    {step === 'analyzing' && (
                        <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
                            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900">Analyzing your file...</h3>
                            <p className="text-gray-500 mt-2">Checking for formatting errors and duplicates</p>
                        </div>
                    )}

                    {step === 'review' && analysis && (
                        <div className="flex flex-col h-full">
                            <div className="px-6 py-3 border-b border-gray-200 bg-blue-50 flex-shrink-0">
                                <label className="text-sm font-semibold text-gray-800 mb-2 block">
                                    📌 Bulk Tag Assignment (Optional)
                                </label>
                                <select
                                    value={bulkTag}
                                    onChange={(e) => setBulkTag(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                >
                                    <option value="">No tag (keep CSV tags only)</option>
                                    {availableTags.map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Add this tag to all contacts (in addition to CSV tags)
                                </p>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <AnalysisReview
                                    analysis={analysis}
                                    onResolveConflict={handleResolveConflict}
                                    onResolveAllConflicts={handleResolveAll}
                                    onDeleteContact={handleDeleteContact}
                                    onUpdateContactTags={handleUpdateContactTags}
                                    availableTags={availableTags}
                                />
                            </div>
                        </div>
                    )}

                    {step === 'saving' && (
                        <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
                            <Loader2 className="w-16 h-16 text-green-600 animate-spin mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900">Saving Contacts...</h3>
                            <p className="text-gray-500 mt-2">Updating database with your changes</p>
                        </div>
                    )}
                </div>

                {/* FOOTER - Fixed at bottom */}
                {step === 'review' && (
                    <div className="px-6 py-4 border-t-2 border-gray-300 bg-gradient-to-r from-gray-50 to-white flex-shrink-0 shadow-2xl">
                        <div className="flex w-full justify-between items-center gap-4">
                            <div className="flex-1">
                                {analysis?.conflicts.length ? (
                                    <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span className="text-xs font-medium">Resolve {analysis.conflicts.length} conflicts first</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-xs font-semibold">✓ Ready: {analysis?.valid.length} contacts</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => { setStep('upload'); setAnalysis(null); setBulkTag(''); }}
                                    className="px-6 py-2 text-sm border-2"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={!analysis || analysis.conflicts.length > 0}
                                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-black px-16 py-4 text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 rounded-lg border-2 border-green-800"
                                >
                                    <CheckCircle2 className="w-7 h-7 mr-3" />
                                    SUBMIT IMPORT
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
