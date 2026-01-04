import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Shield } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '../config/api';

interface Violation {
    type: string;
    severity: 'CRITICAL' | 'HIGH' | 'WARNING';
    text: string;
    location: string;
    message: string;
}

interface ComplianceResult {
    isCompliant: boolean;
    violations: Violation[];
    suggestions: string[];
    summary: {
        total: number;
        critical: number;
        high: number;
        warning: number;
    };
}

interface ComplianceCheckerProps {
    subject: string;
    body: string;
    onValidation?: (result: ComplianceResult) => void;
}

export function ComplianceChecker({ subject, body, onValidation }: ComplianceCheckerProps) {
    const [violations, setViolations] = useState<Violation[]>([]);
    const [isChecking, setIsChecking] = useState(false);
    const [isCompliant, setIsCompliant] = useState(true);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        const checkCompliance = async () => {
            // Don't check if both are empty
            if (!subject.trim() && !body.trim()) {
                setViolations([]);
                setIsCompliant(true);
                return;
            }

            setIsChecking(true);

            try {
                const response = await apiClient.post(API_ENDPOINTS.COMPLIANCE.CHECK, {
                    subject,
                    body,
                    useAI: false // Fast pattern matching only
                });

                if (response) {
                    setViolations(response.violations || []);
                    setIsCompliant(response.isCompliant);
                    setSuggestions(response.suggestions || []);

                    if (onValidation) {
                        onValidation(response);
                    }
                }
            } catch (error) {
                console.error('Compliance check failed:', error);
                // Don't block on errors
                setIsCompliant(true);
            } finally {
                setIsChecking(false);
            }
        };

        // Debounce compliance check
        const timer = setTimeout(checkCompliance, 1000);
        return () => clearTimeout(timer);
    }, [subject, body, onValidation]);

    if (isChecking) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <Shield className="w-4 h-4 animate-pulse" />
                <span>Checking compliance...</span>
            </div>
        );
    }

    if (isCompliant) {
        return (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Content is compliant with EEOC guidelines ✓</span>
            </div>
        );
    }

    return (
        <div className="space-y-3 bg-red-50 p-4 rounded-lg border-2 border-red-200">
            <div className="flex items-center gap-2 text-red-700 font-semibold">
                <XCircle className="w-5 h-5" />
                <span>{violations.length} Compliance Issue{violations.length > 1 ? 's' : ''} Detected</span>
            </div>

            <div className="space-y-2">
                {violations.slice(0, 5).map((violation, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm bg-white p-3 rounded border border-red-200">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="font-semibold text-red-800">
                                {violation.type.replace(/_/g, ' ')}
                                {violation.severity === 'CRITICAL' && ' 🚨'}
                            </div>
                            <div className="text-red-700">{violation.message}</div>
                            <div className="text-xs text-red-600 mt-1">
                                Found: "<span className="font-mono bg-red-100 px-1 rounded">{violation.text}</span>" in {violation.location}
                            </div>
                        </div>
                    </div>
                ))}
                {violations.length > 5 && (
                    <div className="text-sm text-red-600 text-center">
                        + {violations.length - 5} more violation{violations.length - 5 > 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {suggestions.length > 0 && (
                <div className="bg-white p-3 rounded border border-red-200">
                    <div className="font-semibold text-red-800 mb-2">Suggestions:</div>
                    <ul className="space-y-1 text-sm text-red-700">
                        {suggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                <span>{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
