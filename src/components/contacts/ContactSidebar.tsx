import React, { useState, useEffect } from 'react';
import { Users, Tag, Plus, Hash } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { API_ENDPOINTS, apiClient } from '../../config/api';

interface ContactSidebarProps {
    selectedTag: string | null;
    onSelectTag: (tag: string | null) => void;
}

interface TagItem {
    tagName: string;
    color: string;
    description?: string;
}

export function ContactSidebar({ selectedTag, onSelectTag }: ContactSidebarProps) {
    const [tags, setTags] = useState<TagItem[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newTagName, setNewTagName] = useState('');

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await apiClient.get(API_ENDPOINTS.CONTACTS.TAGS);
            // Access the array from the 'tags' property of the response object
            if (res && res.tags && Array.isArray(res.tags)) {
                setTags(res.tags);
            } else {
                setTags([]);
            }
        } catch (err) {
            console.error("Failed to load tags", err);
        }
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        try {
            await apiClient.post(API_ENDPOINTS.CONTACTS.TAGS, {
                tagName: newTagName,
                color: '#3b82f6' // Default blue
            });
            setNewTagName('');
            setIsCreating(false);
            fetchTags();
        } catch (err) {
            console.error("Failed to create tag", err);
        }
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b border-gray-100">
                <Button
                    variant="ghost"
                    className={`w-full justify-start gap-2 ${!selectedTag ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                    onClick={() => onSelectTag(null)}
                >
                    <Users className="w-4 h-4" />
                    All Contacts
                </Button>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Labels</h3>
                    <button onClick={() => setIsCreating(true)} className="text-gray-400 hover:text-blue-600">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {isCreating && (
                    <div className="mb-3 flex gap-1">
                        <Input
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="New Label..."
                            className="h-8 text-sm"
                            autoFocus
                        />
                        <Button size="sm" onClick={handleCreateTag} className="h-8 px-2">Add</Button>
                    </div>
                )}

                <div className="space-y-1">
                    {tags.map((tag) => (
                        <button
                            key={tag.tagName}
                            onClick={() => onSelectTag(tag.tagName)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${selectedTag === tag.tagName ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: tag.color || '#9ca3af' }}
                            />
                            {tag.tagName}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
