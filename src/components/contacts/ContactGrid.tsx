import React from 'react';
import { Mail, Building, Tag, Trash2, Edit2 } from 'lucide-react';
import { Button } from '../ui/button';

interface Contact {
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    tags?: string[];
}

interface ContactGridProps {
    contacts: Contact[];
    isLoading: boolean;
    onDelete: (email: string) => void;
    onEdit: (contact: Contact) => void;
}

export function ContactGrid({ contacts, isLoading, onDelete, onEdit }: ContactGridProps) {
    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading contacts...</div>;
    }

    if (contacts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-lg border border-gray-100 h-96">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No contacts found</h3>
                <p className="text-gray-500 mt-1 max-w-sm">
                    Select a different tag or create new contacts to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Company</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tags</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {contacts.map((contact) => (
                        <tr key={contact.email} className="hover:bg-gray-50 group transition-colors">
                            <td className="py-3 px-4">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">{contact.firstName} {contact.lastName}</span>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3 h-3 text-gray-400" />
                                    {contact.email}
                                </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                                {contact.company && (
                                    <div className="flex items-center gap-2">
                                        <Building className="w-3 h-3 text-gray-400" />
                                        {contact.company}
                                    </div>
                                )}
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                    {contact.tags && Array.isArray(contact.tags) && contact.tags.map(tag => (
                                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                                        onClick={() => onEdit(contact)}
                                        title="Edit contact"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                        onClick={() => onDelete(contact.email)}
                                        title="Delete contact"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
