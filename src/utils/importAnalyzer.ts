import Papa from 'papaparse';
import { apiClient, API_ENDPOINTS } from '../config/api';

export interface ImportRow {
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    first_name?: string; // from DB
    last_name?: string; // from DB
    lastUpdated?: string;
    tags: string[];
}

export interface AnalysisResult {
    valid: AnalyzedContact[];
    conflicts: AnalyzedContact[]; // Exists in DB with different data
    invalid: ImportError[];
}

export interface AnalyzedContact {
    importData: ImportRow;
    currentData?: ImportRow; // If exists in DB
    status: 'new' | 'existing' | 'conflict';
}

export interface ImportError {
    row: any;
    reason: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ImportAnalyzer {

    static async analyze(file: File): Promise<AnalysisResult> {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    try {
                        const analysis = await this.processRows(results.data);
                        resolve(analysis);
                    } catch (e) {
                        reject(e);
                    }
                },
                error: (err) => reject(err)
            });
        });
    }

    private static async processRows(rows: any[]): Promise<AnalysisResult> {
        const validRows: ImportRow[] = [];
        const invalid: ImportError[] = [];

        // 1. Local Validation & Normalization
        for (const row of rows) {
            // Map common CSV headers
            const rawEmail = row['Email'] || row['email'] || row['E-mail'];
            const rawFirst = row['First Name'] || row['FirstName'] || row['first name'] || row['firstname'] || row['firstName'] || '';
            const rawLast = row['Last Name'] || row['LastName'] || row['last name'] || row['lastname'] || row['lastName'] || '';
            const rawCompany = row['Company'] || row['company'] || '';
            const rawTags = row['Tags'] || row['tags'] || row['labels'] || row['Labels'] || '';

            // Validation
            if (!rawEmail || !EMAIL_REGEX.test(rawEmail.trim())) {
                invalid.push({ row, reason: 'Invalid Email Format' });
                continue;
            }

            // Normalization
            const email = rawEmail.toLowerCase().trim();
            const firstName = this.toTitleCase(rawFirst);
            const lastName = this.toTitleCase(rawLast);
            const company = rawCompany.trim();

            // Parse tags (comma-separated)
            const tags = rawTags ? rawTags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];

            validRows.push({ email, firstName, lastName, company, tags });
        }

        // 2. Server Validation (Check Duplicates)
        if (validRows.length === 0) {
            return { valid: [], conflicts: [], invalid };
        }

        const valid: AnalyzedContact[] = [];
        const conflicts: AnalyzedContact[] = [];

        // Batch check against server
        // API expects { emails: string[] }
        const serverCheck = await apiClient.post(API_ENDPOINTS.CONTACTS.VALIDATE, {
            emails: validRows.map(r => r.email)
        });

        const serverResults = serverCheck.results || {};

        for (const row of validRows) {
            const serverResult = serverResults[row.email];

            if (serverResult && serverResult.exists) {
                const dbData = serverResult.data;
                // Check for conflict (Name/Company mismatch)
                const isConflict =
                    (row.firstName && row.firstName !== dbData.firstName) ||
                    (row.lastName && row.lastName !== dbData.lastName) ||
                    (row.company && row.company !== dbData.company);

                if (isConflict) {
                    conflicts.push({
                        importData: row,
                        currentData: dbData,
                        status: 'conflict'
                    });
                } else {
                    // Exact match or safe upgrade -> Treat as 'existing' but valid to tag
                    valid.push({
                        importData: row, // Use import data (same as DB)
                        currentData: dbData,
                        status: 'existing'
                    });
                }
            } else {
                valid.push({
                    importData: row,
                    status: 'new'
                });
            }
        }

        return { valid, conflicts, invalid };
    }

    private static toTitleCase(str: string): string {
        if (!str) return '';
        return str.trim().replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
}
