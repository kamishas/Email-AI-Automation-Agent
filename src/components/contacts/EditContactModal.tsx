import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { TagSelector } from './TagSelector';
import { apiClient, API_ENDPOINTS } from '../../config/api';

interface EditContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contact: {
        email: string;
        firstName: string;
        lastName: string;
        company: string;
        tags?: string[];
    } | null;
}

export function EditContactModal({ isOpen, onClose, onSuccess, contact }: EditContactModalProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        company: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
            console.error("Failed to fetch tags", err);
        }
    };

    useEffect(() => {
        if (contact) {
            setFormData({
                firstName: contact.firstName || '',
                lastName: contact.lastName || '',
                email: contact.email || '',
                company: contact.company || ''
            });
            setSelectedTags(contact.tags || []);
        }
    }, [contact]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiClient.post(API_ENDPOINTS.CONTACTS.ADD, {
                ...formData,
                tags: selectedTags,
                source: 'Manual'
            });
            onSuccess();
            onClose();
        } catch (err) {
            alert('Failed to update contact');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Contact</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">First Name</label>
                            <Input
                                required
                                value={formData.firstName}
                                onChange={handleChange('firstName')}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Last Name</label>
                            <Input
                                required
                                value={formData.lastName}
                                onChange={handleChange('lastName')}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                        <Input
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange('email')}
                            disabled
                            className="bg-gray-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Company</label>
                        <Input
                            value={formData.company}
                            onChange={handleChange('company')}
                        />
                    </div>
                    <TagSelector
                        availableTags={availableTags}
                        selectedTags={selectedTags}
                        onChange={setSelectedTags}
                    />
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
