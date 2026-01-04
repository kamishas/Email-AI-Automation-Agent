import React from 'react';
import { Check } from 'lucide-react';

interface VariantCardProps {
  variant: {
    id: string;
    subject: string;
    body: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export function VariantCard({ variant, isSelected, onSelect }: VariantCardProps) {
  return (
    <div
      className={`relative bg-white rounded-xl border-2 p-6 transition-all cursor-pointer hover:shadow-md ${
        isSelected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Check className="w-5 h-5 text-white" />
        </div>
      )}

      {/* Subject */}
      <div className="mb-4 pr-12">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Subject Line
        </label>
        <p className="text-gray-900 font-medium">{variant.subject}</p>
      </div>

      {/* Body Preview */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Body Preview
        </label>
        <p className="text-sm text-gray-700 line-clamp-4">{variant.body}</p>
      </div>

      {/* Select Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          isSelected
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isSelected ? 'Selected' : 'Select This'}
      </button>
    </div>
  );
}
