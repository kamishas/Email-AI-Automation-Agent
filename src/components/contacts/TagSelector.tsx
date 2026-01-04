import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface TagSelectorProps {
    availableTags: string[];
    selectedTags: string[];
    onChange: (tags: string[]) => void;
}

export function TagSelector({ availableTags, selectedTags, onChange }: TagSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleTag = (tag: string) => {
        const safeTags = Array.isArray(selectedTags) ? selectedTags : [];
        if (safeTags.includes(tag)) {
            onChange(safeTags.filter(t => t !== tag));
        } else {
            onChange([...safeTags, tag]);
        }
    };

    const removeTag = (tag: string) => {
        const safeTags = Array.isArray(selectedTags) ? selectedTags : [];
        onChange(safeTags.filter(t => t !== tag));
    };

    // Ensure props are arrays
    const safeAvailableTags = Array.isArray(availableTags) ? availableTags : [];
    const safeSelectedTags = Array.isArray(selectedTags) ? selectedTags : [];

    return (
        <div className="space-y-2" ref={dropdownRef}>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Tags (Labels)
            </label>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                    {safeSelectedTags.length > 0
                        ? `${safeSelectedTags.length} tag${safeSelectedTags.length > 1 ? 's' : ''} selected`
                        : 'Select tags...'}
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {safeAvailableTags.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">
                                No tags available. Create tags in the sidebar first.
                            </div>
                        ) : (
                            safeAvailableTags.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center justify-between transition-colors"
                                >
                                    <span className="text-gray-700">{tag}</span>
                                    {safeSelectedTags.includes(tag) && (
                                        <Check className="w-4 h-4 text-blue-600" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {safeSelectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {safeSelectedTags.map(tag => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:text-blue-900 focus:outline-none"
                                aria-label={`Remove ${tag}`}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
