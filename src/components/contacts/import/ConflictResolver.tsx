import React from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/button';
import { AnalyzedContact } from '../../../utils/importAnalyzer';

interface ConflictResolverProps {
    conflicts: AnalyzedContact[];
    onResolve: (email: string, resolution: 'db' | 'csv') => void;
    onResolveAll: (resolution: 'db' | 'csv') => void;
}

export function ConflictResolver({ conflicts, onResolve, onResolveAll }: ConflictResolverProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Found {conflicts.length} conflicts</span>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-gray-600"
                        onClick={() => onResolveAll('db')}
                    >
                        Keep Existing (Safe)
                    </Button>
                    <Button
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        onClick={() => onResolveAll('csv')}
                    >
                        Overwrite All
                    </Button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 w-1/3">Existing (In Database)</th>
                            <th className="px-4 py-3 w-1/3 text-center">Conflict Field</th>
                            <th className="px-4 py-3 w-1/3">New (From CSV)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {conflicts.map(({ importData, currentData }) => {
                            if (!currentData) return null;
                            const email = importData.email;

                            // Identify changed fields
                            const diffs = [];
                            if (importData.firstName !== currentData.firstName) diffs.push('First Name');
                            if (importData.lastName !== currentData.lastName) diffs.push('Last Name');
                            if (importData.company !== currentData.company) diffs.push('Company');

                            return (
                                <tr key={email} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 align-top">
                                        <div className="font-medium text-gray-900">{currentData.firstName} {currentData.lastName}</div>
                                        <div className="text-gray-500">{currentData.company}</div>
                                        <div className="text-xs text-gray-400 mt-1">Last Updated: {currentData.lastUpdated || 'Unknown'}</div>
                                        <Button
                                            size="sm" variant="ghost" className="mt-2 text-blue-600 hover:bg-blue-50 h-7 text-xs"
                                            onClick={() => onResolve(email, 'db')}
                                        >
                                            Keep This
                                        </Button>
                                    </td>
                                    <td className="px-4 py-4 align-top text-center">
                                        <div className="inline-flex items-center justify-center p-1 bg-gray-100 rounded text-xs font-medium text-gray-600 mb-2">
                                            {email}
                                        </div>
                                        {diffs.map(field => (
                                            <div key={field} className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded inline-block mx-1">
                                                {field} Mismatch
                                            </div>
                                        ))}
                                        <div className="flex justify-center my-2">
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="font-medium text-gray-900">{importData.firstName} {importData.lastName}</div>
                                        <div className="text-gray-500">{importData.company}</div>
                                        <div className="text-xs text-green-600 mt-1">New Import Data</div>
                                        <Button
                                            size="sm" variant="ghost" className="mt-2 text-blue-600 hover:bg-blue-50 h-7 text-xs"
                                            onClick={() => onResolve(email, 'csv')}
                                        >
                                            Use This
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
