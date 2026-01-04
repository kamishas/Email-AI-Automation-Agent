import React, { useState, useEffect } from 'react';
import { Plus, Upload, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ContactSidebar } from '../components/contacts/ContactSidebar';
import { ContactGrid } from '../components/contacts/ContactGrid';
import { ImportWizard } from '../components/contacts/import/ImportWizard';
import { AddContactModal } from '../components/contacts/AddContactModal';
import { EditContactModal } from '../components/contacts/EditContactModal';
import { API_ENDPOINTS, apiClient } from '../config/api';

export function ContactsPage() {
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isAddContactOpen, setIsAddContactOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchContacts();
    }, [selectedTag]);

    const fetchContacts = async () => {
        setIsLoading(true);
        try {
            const url = selectedTag
                ? `${API_ENDPOINTS.CONTACTS.LIST}?tag=${encodeURIComponent(selectedTag)}`
                : API_ENDPOINTS.CONTACTS.LIST;

            const res = await apiClient.get(url);
            setContacts(res.contacts || []);
        } catch (err) {
            console.error("Failed to fetch contacts", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (email: string) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;
        try {
            await apiClient.post(API_ENDPOINTS.CONTACTS.DELETE, { email });
            fetchContacts(); // Refresh
        } catch (err) {
            alert('Failed to delete contact');
        }
    };

    const handleEdit = (contact: any) => {
        setEditingContact(contact);
        setIsEditModalOpen(true);
    };

    // Filter local search
    const filteredContacts = contacts.filter((c: any) =>
        c.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
            {/* Sidebar */}
            <ContactSidebar selectedTag={selectedTag} onSelectTag={setSelectedTag} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
                {/* Toolbar */}
                <div className="px-8 py-5 bg-white border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {selectedTag ? selectedTag : 'All Contacts'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {contacts.length} total contacts
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search contacts..."
                                className="pl-9 w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="gap-2" onClick={() => setIsImportOpen(true)}>
                            <Upload className="w-4 h-4" />
                            Import
                        </Button>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddContactOpen(true)}>
                            <Plus className="w-4 h-4" />
                            Add Contact
                        </Button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto p-8">
                    <ContactGrid
                        contacts={filteredContacts}
                        isLoading={isLoading}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                </div>
            </div>

            <ImportWizard
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onComplete={() => {
                    fetchContacts();
                    setIsImportOpen(false);
                }}
            />

            <AddContactModal
                isOpen={isAddContactOpen}
                onClose={() => setIsAddContactOpen(false)}
                onSuccess={() => {
                    fetchContacts();
                    setIsAddContactOpen(false);
                }}
            />

            <EditContactModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingContact(null);
                }}
                onSuccess={() => {
                    fetchContacts();
                    setIsEditModalOpen(false);
                    setEditingContact(null);
                }}
                contact={editingContact}
            />
        </div>
    );
}
