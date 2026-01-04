import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { AnalysisResult, AnalyzedContact, ImportError } from '../../../utils/importAnalyzer';
import { ConflictResolver } from './ConflictResolver';
import { Check, AlertTriangle, XCircle, Trash2, X } from 'lucide-react';

interface AnalysisReviewProps {
    analysis: AnalysisResult;
    onResolveConflict: (email: string, resolution: 'db' | 'csv') => void;
    onResolveAllConflicts: (resolution: 'db' | 'csv') => void;
    onDeleteContact?: (email: string) => void;
    onUpdateContactTags?: (email: string, tags: string[]) => void;
    availableTags?: string[];
}

export function AnalysisReview({ analysis, onResolveConflict, onResolveAllConflicts, onDeleteContact, onUpdateContactTags, availableTags = [] }: AnalysisReviewProps) {
    const [activeTab, setActiveTab] = useState('valid');

    return (
        <div className="flex flex-col h-full">
            <Tabs defaultValue="valid" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="px-4 pt-3 pb-2 border-b border-gray-200 bg-gray-50">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="valid" className="flex items-center gap-1.5 text-sm">
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            Valid ({analysis.valid.length})
                        </TabsTrigger>
                        <TabsTrigger value="conflicts" className="flex items-center gap-1.5 text-sm">
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />
                            Conflicts ({analysis.conflicts.length})
                        </TabsTrigger>
                        <TabsTrigger value="invalid" className="flex items-center gap-1.5 text-sm">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            Invalid ({analysis.invalid.length})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-auto bg-gray-50 p-4">
                    {/* VALID TAB */}
                    <TabsContent value="valid" className="mt-0 space-y-4">
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-200 sticky top-0">
                                        <tr>
                                            <th className="px-2 py-2 w-24">First Name</th>
                                            <th className="px-2 py-2 w-24">Last Name</th>
                                            <th className="px-2 py-2 w-48">Email</th>
                                            <th className="px-2 py-2 w-40">Company</th>
                                            <th className="px-2 py-2 w-32">Tags</th>
                                            <th className="px-2 py-2 w-36">Actions</th>
                                            <th className="px-2 py-2 w-24">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {analysis.valid.map((c) => (
                                            <tr key={c.importData.email} className="hover:bg-gray-50">
                                                <td className="px-2 py-2 font-medium text-gray-900">
                                                    {c.importData.firstName}
                                                </td>
                                                <td className="px-2 py-2 font-medium text-gray-900">
                                                    {c.importData.lastName}
                                                </td>
                                                <td className="px-2 py-2 text-gray-600 text-xs">{c.importData.email}</td>
                                                <td className="px-2 py-2 text-gray-600 text-xs">{c.importData.company}</td>
                                                <td className="px-2 py-2">
                                                    <div className="flex flex-wrap gap-0.5">
                                                        {c.importData.tags && c.importData.tags.length > 0 ? (
                                                            c.importData.tags.map(tag => (
                                                                <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 group">
                                                                    {tag}
                                                                    {onUpdateContactTags && (
                                                                        <button
                                                                            onClick={() => {
                                                                                const newTags = c.importData.tags.filter(t => t !== tag);
                                                                                onUpdateContactTags(c.importData.email, newTags);
                                                                            }}
                                                                            className="ml-1 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            title="Remove tag"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2">
                                                    <div className="flex items-center gap-1">
                                                        {/* Tag Dropdown */}
                                                        {onUpdateContactTags && (
                                                            <select
                                                                value=""
                                                                onChange={(e) => {
                                                                    if (e.target.value) {
                                                                        const newTags = c.importData.tags.includes(e.target.value)
                                                                            ? c.importData.tags
                                                                            : [...c.importData.tags, e.target.value];
                                                                        onUpdateContactTags(c.importData.email, newTags);
                                                                        e.target.value = '';
                                                                    }
                                                                }}
                                                                className="text-xs border border-gray-300 rounded px-1.5 py-0.5 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                                title="Add tag to this contact"
                                                            >
                                                                <option value="">+ Tag</option>
                                                                {availableTags.map(tag => (
                                                                    <option key={tag} value={tag}>{tag}</option>
                                                                ))}
                                                            </select>
                                                        )}

                                                        {/* Delete Button */}
                                                        {onDeleteContact && (
                                                            <button
                                                                onClick={() => onDeleteContact(c.importData.email)}
                                                                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
                                                                title="Remove from import"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2">
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${c.status === 'new' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {c.status === 'new' ? 'New' : 'Update'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {analysis.valid.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                    No valid new contacts found. Check conflicts or errors.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* CONFLICTS TAB */}
                    <TabsContent value="conflicts" className="mt-0">
                        {analysis.conflicts.length > 0 ? (
                            <ConflictResolver
                                conflicts={analysis.conflicts}
                                onResolve={onResolveConflict}
                                onResolveAll={onResolveAllConflicts}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                                <Check className="w-12 h-12 text-green-500 mb-2" />
                                <p>No conflicts found! You are good to go.</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* INVALID TAB */}
                    <TabsContent value="invalid" className="mt-0">
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3">Messages</th>
                                        <th className="px-4 py-3">Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {analysis.invalid.map((err, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-900 font-mono text-xs">
                                                {JSON.stringify(err.row)}
                                            </td>
                                            <td className="px-4 py-3 text-red-600 font-medium">
                                                {err.reason}
                                            </td>
                                        </tr>
                                    ))}
                                    {analysis.invalid.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                                                No invalid rows found. Perfect CSV!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
