import React, { useState, useEffect, useMemo } from 'react';
import { Search, Tag, Users, CheckSquare, Square, X } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '../../config/api';

interface Contact {
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    tags: string[];
}

interface ContactTag {
    tagId: string;
    tagName: string;
    contactCount: number;
}

interface RecipientSelectorProps {
    onRecipientsChange: (recipients: Contact[]) => void;
    initialRecipients?: Contact[];
}

export default function RecipientSelector({ onRecipientsChange, initialRecipients = [] }: RecipientSelectorProps) {
    const [selectionMode, setSelectionMode] = useState<'label' | 'search'>('label');
    const [tags, setTags] = useState<ContactTag[]>([]);
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<Set<string>>(
        new Set(initialRecipients.map(c => c.email))
    );
    const [loading, setLoading] = useState(false);

    // Fetch tags on mount
    useEffect(() => {
        fetchTags();
        fetchAllContacts();
    }, []);

    const fetchTags = async () => {
        try {
            console.log('[RecipientSelector] Fetching tags from:', API_ENDPOINTS.CONTACTS.TAGS);
            const response = await apiClient.get(API_ENDPOINTS.CONTACTS.TAGS);
            console.log('[RecipientSelector] Tags response:', response);

            // Extract tags from response object
            const tagsArray = Array.isArray(response) ? response : (response.tags || []);
            console.log('[RecipientSelector] Tags array:', tagsArray, 'Length:', tagsArray.length);
            setTags(tagsArray);
        } catch (error) {
            console.error('[RecipientSelector] Error fetching tags:', error);
            setTags([]); // Set empty array on error
        }
    };

    const fetchAllContacts = async () => {
        try {
            setLoading(true);
            console.log('[RecipientSelector] Fetching contacts from:', API_ENDPOINTS.CONTACTS.LIST);
            const response = await apiClient.get(API_ENDPOINTS.CONTACTS.LIST);
            console.log('[RecipientSelector] Contacts response:', response);

            // Extract contacts from response object
            const contactsArray = Array.isArray(response) ? response : (response.contacts || []);
            console.log('[RecipientSelector] Contacts array:', contactsArray, 'Length:', contactsArray.length);
            setAllContacts(contactsArray);
        } catch (error) {
            console.error('[RecipientSelector] Error fetching contacts:', error);
            setAllContacts([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    // Fetch contacts by tag
    const fetchContactsByTag = async (tagName: string) => {
        if (!tagName) {
            setSelectedContacts(new Set());
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.get(`${API_ENDPOINTS.CONTACTS.LIST}?tag=${encodeURIComponent(tagName)}`);
            // Extract contacts from response object
            const contacts = Array.isArray(response) ? response : (response.contacts || []);

            // Auto-select all contacts from this tag
            const emailSet = new Set(contacts.map((c: Contact) => c.email));
            setSelectedContacts(emailSet);

            // Notify parent
            onRecipientsChange(contacts);
        } catch (error) {
            console.error('Error fetching contacts by tag:', error);
            setSelectedContacts(new Set());
            onRecipientsChange([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle tag selection
    const handleTagChange = (tagName: string) => {
        setSelectedTag(tagName);
        fetchContactsByTag(tagName);
    };

    // Filter contacts by search query
    const filteredContacts = useMemo(() => {
        if (!searchQuery.trim()) return allContacts;

        const query = searchQuery.toLowerCase();
        return allContacts.filter(contact =>
            contact.email.toLowerCase().includes(query) ||
            contact.firstName.toLowerCase().includes(query) ||
            contact.lastName.toLowerCase().includes(query) ||
            contact.company.toLowerCase().includes(query)
        );
    }, [allContacts, searchQuery]);

    // Toggle contact selection
    const toggleContact = (contact: Contact) => {
        const newSelected = new Set(selectedContacts);

        if (newSelected.has(contact.email)) {
            newSelected.delete(contact.email);
        } else {
            newSelected.add(contact.email);
        }

        setSelectedContacts(newSelected);

        // Get full contact objects
        const selectedContactsList = allContacts.filter(c => newSelected.has(c.email));
        onRecipientsChange(selectedContactsList);
    };

    // Select all filtered contacts
    const selectAll = () => {
        const newSelected = new Set(selectedContacts);
        filteredContacts.forEach(contact => newSelected.add(contact.email));
        setSelectedContacts(newSelected);

        const selectedContactsList = allContacts.filter(c => newSelected.has(c.email));
        onRecipientsChange(selectedContactsList);
    };

    // Deselect all
    const deselectAll = () => {
        setSelectedContacts(new Set());
        onRecipientsChange([]);
    };

    // Remove individual contact
    const removeContact = (email: string) => {
        const newSelected = new Set(selectedContacts);
        newSelected.delete(email);
        setSelectedContacts(newSelected);

        const selectedContactsList = allContacts.filter(c => newSelected.has(c.email));
        onRecipientsChange(selectedContactsList);
    };

    const selectedContactsList = allContacts.filter(c => selectedContacts.has(c.email));

    return (
        <div className="space-y-6">
            {/* Selection Mode Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setSelectionMode('label')}
                    className={`pb-3 px-4 font-medium transition-colors ${selectionMode === 'label'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Tag className="w-4 h-4 inline mr-2" />
                    Select by Label
                </button>
                <button
                    onClick={() => setSelectionMode('search')}
                    className={`pb-3 px-4 font-medium transition-colors ${selectionMode === 'search'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Search className="w-4 h-4 inline mr-2" />
                    Search & Select
                </button>
            </div>

            {/* Label Selection Mode */}
            {selectionMode === 'label' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Choose a Label
                        </label>
                        <select
                            value={selectedTag}
                            onChange={(e) => handleTagChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={loading}
                        >
                            <option value="">-- Select a label --</option>
                            {tags.map(tag => (
                                <option key={tag.tagId} value={tag.tagName}>
                                    {tag.tagName} ({tag.contactCount} contacts)
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedTag && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-blue-700">
                                <Users className="w-5 h-5" />
                                <span className="font-semibold">
                                    {selectedContacts.size} contacts selected from "{selectedTag}"
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Search & Select Mode */}
            {selectionMode === 'search' && (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={selectAll}
                            className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            Select All ({filteredContacts.length})
                        </button>
                        <button
                            onClick={deselectAll}
                            className="px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Deselect All
                        </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading contacts...</div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No contacts found</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredContacts.map(contact => (
                                    <label
                                        key={contact.email}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleContact(contact)}
                                            className="flex-shrink-0"
                                        >
                                            {selectedContacts.has(contact.email) ? (
                                                <CheckSquare className="w-5 h-5 text-blue-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900">
                                                {contact.firstName} {contact.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500 truncate">{contact.email}</div>
                                            {contact.company && (
                                                <div className="text-xs text-gray-400">{contact.company}</div>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Selected Recipients Summary */}
            {selectedContacts.size > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-green-700 font-semibold">
                            <Users className="w-5 h-5" />
                            <span>{selectedContacts.size} Recipients Selected</span>
                        </div>
                        <button
                            onClick={deselectAll}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {selectedContactsList.slice(0, 10).map(contact => (
                            <div
                                key={contact.email}
                                className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm border border-green-200"
                            >
                                <span className="text-gray-700">
                                    {contact.firstName} {contact.lastName}
                                </span>
                                <button
                                    onClick={() => removeContact(contact.email)}
                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {selectedContacts.size > 10 && (
                            <div className="inline-flex items-center px-3 py-1 text-sm text-gray-500">
                                +{selectedContacts.size - 10} more
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
